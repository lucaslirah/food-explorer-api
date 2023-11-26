const knex = require('../database/knex');

class DishesController{
    async create(request, response){
        const { name, description, price, picture, type, ingredients } = request.body;

        const [dish_id] = await knex('dishes').insert({
            name,
            description,
            price,
            picture,
            type
        });

        const ingredientsInsert = ingredients.map(name => {
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

        const dish = await knex('dishes').where({ id }).first();
        const ingredients = await knex('ingredients').where({ dish_id: id }).orderBy('name');

        return response.json({
            ...dish,
            ingredients
        });
    }

    async delete(request, response){
        const { id } = request.params;

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
}

module.exports = DishesController;