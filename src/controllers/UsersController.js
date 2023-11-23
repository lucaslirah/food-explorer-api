const AppError = require('../utils/AppError');
const knex = require('../database/knex');
const { hash } = require('bcryptjs');

class UsersController{
    async create(request, response){
        const { name, password, email } = request.body;

        
        if(!name){
            throw new AppError("Por favor, insira um nome!");
        }
        
        const [emailExists] = await knex('users').where({ email });

        if(emailExists){
            throw new AppError('Email já em uso!');
        }

        const hashedPassword = await hash(password, 8);
        
        await knex('users').insert({
            name,
            email,
            password: hashedPassword
        });

        return response.status(201).json();
    }
}

module.exports = UsersController;