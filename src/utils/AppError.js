class AppError{
    message;
    statuscode;

    constructor(message, statusCode = 400){
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = AppError;