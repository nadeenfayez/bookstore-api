const { nodeEnv } = require("../configs/envConfigs");

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (nodeEnv === "development") return res.status(statusCode).json({
        success: false,
        error: {
            message,
            statusCode,
            stack: err.stack
        }
    });

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            statusCode
        }
    });
};


module.exports = globalErrorHandler;