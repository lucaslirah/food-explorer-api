const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const { compare } = require('bcryptjs');

class SessionsController{
    async create(request, response){
        const { email, password } = request.body;

        const user = await knex('users').where({ email }).first();

        if(!user){
            throw new AppError('Email e/ou senha incorretos.', 401);
        }

        const matchPassword = await compare(password, user.password);

        if(!matchPassword){
            throw new AppError('Email e/ou senha incorretos.', 401);
        }
        
        return response.status(201).json(user);
    }
}

module.exports = SessionsController;