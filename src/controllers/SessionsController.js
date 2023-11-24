const AppError = require('../utils/AppError');
const authConfig = require('../configs/auth');
const knex = require('../database/knex');
const { sign } = require('jsonwebtoken');
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

        const { secret, expiresIn } = authConfig.jwt;
        const token = sign({ role: user.role }, secret, {
            subject: String(user.id),
            expiresIn
        });

        response.cookie('secret', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 15 * 60 * 1000
        });

        delete user.password;
        
        return response.status(201).json({ user });
    }
}

module.exports = SessionsController;