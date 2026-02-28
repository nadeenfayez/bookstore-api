const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require("../configs/envConfigs");

const generateAccessToken = (payload, userId) => {
    return jwt.sign(payload, jwtSecret, {
        expiresIn: jwtExpiresIn,
        issuer: "bookstore-api",
        subject: String(userId)
    });
}

const generateRefreshToken = (payload, userId) => {
    return jwt.sign(payload, jwtRefreshSecret, {
        expiresIn: jwtRefreshExpiresIn,
        issuer: "bookstore-api",
        subject: String(userId)
    });
}

const verifyAccessToken = (accessToken) => {
    return jwt.verify(accessToken, jwtSecret);
};

const verifyRefreshToken = (refreshtoken) => {
    return jwt.verify(refreshtoken, jwtRefreshSecret);
};


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};