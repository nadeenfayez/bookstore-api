const { verifyToken } = require("../utils/jwtUtils");
const AppError = require("../utils/AppError");

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    const accessToken = authHeader?.substring(7);

    if (!accessToken) throw new AppError("Missing access token!", 401);

    try {
        const decoded = verifyToken(accessToken);
        req.currentUser = { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role };
        next();
    }
    catch (err) {
        throw new AppError("Invalid or expired token!", 401);
    }
};


module.exports = requireAuth;