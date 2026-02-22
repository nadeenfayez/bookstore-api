const handleAsyncError = (fn) => {  //Express Middleware Factory Pattern  //To don't write many try & catch inside each endpoint logic
    return (req, res, next) => {
        fn(req, res, next).catch(err => next(err));
    };
};


module.exports = handleAsyncError;