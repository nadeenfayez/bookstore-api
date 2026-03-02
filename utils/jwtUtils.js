const jwt = require("jsonwebtoken");
const { accessTokenSecret, accessTokenExpiry, refreshTokenSecret, refreshTokenExpiry } = require("../configs/envConfigs");


const generateAccessToken = (payload, userId) => {
    return jwt.sign(payload, accessTokenSecret, {
        expiresIn: accessTokenExpiry,
        issuer: "bookstore-api",
        subject: String(userId)
    });
}

const generateRefreshToken = (payload, userId) => {
    // return crypto.randomBytes(64).toString("hex");   // Opaque approach
    return jwt.sign(payload, refreshTokenSecret, {
        expiresIn: refreshTokenExpiry,
        issuer: "bookstore-api",
        subject: String(userId)
    });
}

const verifyAccessToken = (accessToken) => {
    return jwt.verify(accessToken, accessTokenSecret);
};

const verifyRefreshToken = (refreshtoken) => {
    return jwt.verify(refreshtoken, refreshTokenSecret);
};


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};