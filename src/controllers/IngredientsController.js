const knex = require('../database/knex');

class IngredientsController{
    async create(request, response){
        const { id } = request.params;
        const { ingredients } = request.body;
        
        const [dish] = await knex('dishes').where({ id });

        const ingredientsInsert = ingredients.map(name => {
            return{
                name,
                dish_id: dish.id
            }
        });

        await knex('ingredients').insert(ingredientsInsert);

        return response.status(201).json();
    }

    async delete(request, response){
        const { id } = request.params;
        const { ingredients } = request.body;
        
        const [dish] = await knex('dishes').where({ id });
        
        await knex('ingredients')
        .whereIn('name', ingredients)
        .where({ dish_id: dish.id })
        .delete();

        return response.status(200).json();
    }
}

module.exports = IngredientsController;