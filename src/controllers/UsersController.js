const AppError = require('../utils/AppError')

class UsersController{
    create(request, response){
        const { name, password, email } = request.body;

        if(!name){
            throw new AppError("Por favor, insira um nome.");
        }

        response.status(201).json({ name, password, email });
    }
}

module.exports = UsersController;