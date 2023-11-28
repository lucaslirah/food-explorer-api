const DiskStorage = require('../providers/DiskStorage');
const knex = require('../database/knex');
const AppError = require('../utils/AppError');

class DishesPicturesController{
    async update(request, response){
        const { dish_id } = request.body;
        const pictureFilename = request.file.filename;

        const diskStorage = new DiskStorage();

        const dish = await knex('dishes')
        .where({ id: dish_id }).first();

        if(dish.picture){
            await diskStorage.deleteFile(dish.picture);
        }

        const filename = await diskStorage.saveFile(pictureFilename);
        dish.picture = filename;

        await knex('dishes').update(dish).where({ id: dish_id });

        return response.json(dish);
    }
}

module.exports = DishesPicturesController;