const AppError = require("../utils/AppError");

const notFoundHandler = (req, res, next) => {
    next(new AppError(`Invalid URL ${req.originalUrl}`, 404));
};


module.exports = notFoundHandler;