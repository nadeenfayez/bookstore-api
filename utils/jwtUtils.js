const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn } = require("../configs/envConfigs");

const generateToken = (payload, userId) => {
    return jwt.sign(payload, jwtSecret, {
        expiresIn: jwtExpiresIn,
        issuer: "bookstore-api",
        subject: String(userId)
    });
}

const verifyToken = (token) => {
    return jwt.verify(token, jwtSecret);
};


module.exports = {
    generateToken,
    verifyToken
};