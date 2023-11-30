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
        const { name, ingredients } = request.query;

        let dishes;

        if(ingredients){
            const filterIngredients = ingredients.split(',').map(ing => ing.trim());

            dishes = await knex('ingredients')
            .select([
                'dishes.id',
                'dishes.name',
                'dishes.description',
                'dishes.price',
                'dishes.picture'
            ])
            .whereLike('dishes.name', `%${name}%`)
            .whereIn('ingredients.name', filterIngredients)
            .innerJoin('dishes', 'dishes.id', 'ingredients.dish_id')
            .groupBy('dishes.id')
            .orderBy('dishes.name');
        }else{
            dishes = await knex('dishes')
            .whereLike('name', `%${name}%`)
            .orderBy('name');
        }

        const ingredientsDish = await knex('ingredients');

        const dishesWithIngredients = dishes.map(dish => {
            const dishIngs = ingredientsDish.filter(ing => ing.dish_id === dish.id);

            return{
                ...dish,
                ingredients: dishIngs
            }
        });

        return response.json(dishesWithIngredients);
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