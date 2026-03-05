const AppError = require("../utils/AppError");

const requireRole = (...allowedRoles) => {  // Express Middleware Factory Pattern
    return (req, res, next) => {
        if (!allowedRoles.includes(req.currentUser?.role)) throw new AppError("Forbidden.", 403);
        next();
    };
};


module.exports = requireRole;