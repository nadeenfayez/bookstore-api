const { verifyAccessToken } = require("../utils/jwtUtils");
const AppError = require("../utils/AppError");


const requireAuth = (req, res, next) => {
    const authHeader = req?.headers?.authorization;

    const accessToken = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!accessToken) throw new AppError("Missing access token.", 401);

    try {
        const decoded = verifyAccessToken(accessToken);

        req.currentUser = { id: decoded.sub, role: decoded.role };
        next();
    }
    catch (err) {
        console.error("Access token middleware verification error:", err);
        throw new AppError("Invalid or expired token.", 401);
    }
};


module.exports = requireAuth;