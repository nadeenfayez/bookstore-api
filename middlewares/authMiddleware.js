const { verifyToken } = require("../utils/jwtUtils");
const AppError = require("../utils/AppError");

const requireAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) throw new AppError("Missing access token!", 401);

    // const token = authHeader.substring(7);

    try {
        const decoded = verifyToken(token);
        req.currentUser = { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role };
        next();
    }
    catch (err) {
        throw new AppError("Invalid or expired token!", 401);
    }
};


module.exports = requireAuth;