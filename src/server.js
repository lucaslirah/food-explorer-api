require('express-async-errors');

const express = require('express');

const routes = require('./routes');

const AppError = require('./utils/AppError');
const uploadConfig = require('./configs/upload');

const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use('/files', express.static(uploadConfig.UPLOADS_FOLDER));
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