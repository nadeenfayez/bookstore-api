const loggerMiddleware = (req, res, next) => {
    const method = req.method;
    const date = new Date().toUTCString();
    const url = req.url;
    console.log(`Received Request at: ${date}, method: ${method}, url: ${url}`);
    next();
};


module.exports = loggerMiddleware;