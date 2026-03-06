const jwt = require("jsonwebtoken");
const { accessTokenSecret, accessTokenExpiry, refreshTokenSecret, refreshTokenExpiry } = require("../configs/envConfigs");
const AppError = require("./AppError");


const generateAccessToken = (payload, userId) => {
    try {
        return jwt.sign(payload, accessTokenSecret, {
            expiresIn: accessTokenExpiry,
            issuer: "bookstore-api",
            subject: String(userId)
        });
    }
    catch (err) {
        console.error(err);
        throw new AppError("Failed to generate access token.", 500);
    }

}

const generateRefreshToken = (payload, userId) => {
    // return crypto.randomBytes(64).toString("hex");   // Opaque approach
    try {
        return jwt.sign(payload, refreshTokenSecret, {
            expiresIn: refreshTokenExpiry,
            issuer: "bookstore-api",
            subject: String(userId)
        });
    }
    catch (err) {
        console.error(err);
        throw new AppError("Failed to generate refresh token.", 500);
    }

}

const verifyAccessToken = (accessToken) => {
    try {
        return jwt.verify(accessToken, accessTokenSecret);
    }
    catch (err) {
        console.error(err);
        throw new AppError("Invalid or expired access token.", 401);
    }
};

const verifyRefreshToken = (refreshtoken) => {
    try {
        return jwt.verify(refreshtoken, refreshTokenSecret);
    }
    catch (err) {
        console.error(err);
        throw new AppError("Invalid or expired refresh token.", 401);
    }
};


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};