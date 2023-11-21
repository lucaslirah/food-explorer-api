require('express-async-errors');

const express = require('express');

const routes = require('./routes');

const AppError = require('./utils/AppError');

const app = express();

app.use(express.json());
app.use(routes);
app.use(( error, request, response, next ) => {
    if(error instanceof AppError){
        return response.status(error.statusCode).json({
            message: error.message,
            status: "error"
        });
    }

    console.error(error);

    return response.status(500).json({
        message: "Internal server error",
        status: "error"
    });
});

const PORT = 3333;
app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));