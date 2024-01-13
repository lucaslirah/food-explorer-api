const knex = require('../database/knex');
const AppErr = require('../utils/AppError');
const { format, setGlobalDateMasks } = require("fecha");
const DiskStorage = require('../providers/DiskStorage');
const diskStorage = new DiskStorage();

setGlobalDateMasks({
    dateTimeMask: 'YYYY-MM-DD HH:mm:ss'
});

class DishesController{
    async create(request, response){
        const { name, description, price, type, ingredients } = request.body;

        const pictureFilename = request.file.filename;

        const filename = await diskStorage.saveFile(pictureFilename);

        const timestamp = format(Date.now(), 'dateTimeMask');

        const [dish_id] = await knex('dishes').insert({
            name,
            description,
            price,
            picture: filename,
            type,
            created_at: timestamp,
            updated_at: timestamp
        });

        const ingredientsArray = ingredients.split(',').map(ing => ing.trim());

        const ingredientsInsert = ingredientsArray.map(name => {
            return {
                name,
                dish_id
            }
        });

        await knex('ingredients').insert(ingredientsInsert);


        return response.status(201).json();
    }

    async show(request, response){
        const { id } = request.params;

        const dish = await knex('dishes')
        .where({ id })
        .first();
        
        const ingredients = await knex('ingredients')
        .where({ dish_id: id })
        .orderBy('name');

        return response.json({
            ...dish,
            ingredients
        });
    }

    async delete(request, response){
        const { id } = request.params;

        const [dish] = await knex('dishes').where({ id });

        if(dish.picture){
            await diskStorage.deleteFile(dish.picture);
        }

        await knex('dishes').where({ id }).delete();

        return response.json();
    }

    async index(request, response){
        const { query } = request.query;

        let dishes;

        if(!query){
            dishes = await knex('dishes')
            .orderBy('name');
        }else{
            dishes = await knex('dishes')
            .select([
                'dishes.id',
                'dishes.name',
                'dishes.description',
                'dishes.price',
                'dishes.picture',
            ], 'ingredients.name as name_ingredients')
            .innerJoin('ingredients', 'dishes.id', '=', 'ingredients.dish_id')
            .whereLike('dishes.name', `%${query}%`)
            .orWhereLike('ingredients.name', `%${query}%`)
            .groupBy('dishes.id')
            .orderBy('dishes.name');
        }

        return response.json(dishes);
    }

    async update(request, response){
        const { id, name, description, price, type } = request.body;
        const pictureFilename = request.file.filename;
        
        const [dish] = await knex('dishes').where({ id });

        if(!dish){
            throw new AppErr('Prato não encontrado!');
        }

        if(dish.picture){
            await diskStorage.deleteFile(dish.picture);
        }

        const filename = await diskStorage.saveFile(pictureFilename);

        const timestamp = format(Date.now(), 'dateTimeMask');

        dish.picture = filename;
        dish.updated_at = timestamp;
        dish.name = name ?? dish.name;
        dish.description = description ?? dish.description;
        dish.price = price ?? dish.price;
        dish.type = type ?? dish.type;

        await knex('dishes').where({ id: dish.id }).update(dish);

        return response.status(200).json(dish);
    }
}

module.exports = DishesController;