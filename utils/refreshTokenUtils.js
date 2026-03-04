const crypto = require("crypto");
const { refreshTokenTtlMs, maxRefreshTokens } = require("../configs/envConfigs");


const hashRefreshToken = (refreshtoken) => {
    return crypto.createHash("sha256").update(refreshtoken).digest("hex");
};

const addRefreshToken = (userDoc, refreshTokenHash, req) => {
    const now = Date.now();

    // Remove expired tokens
    userDoc.refreshTokens = userDoc.refreshTokens.filter(rt => rt.expiresAt?.getTime() > now);

    // If we have more than MAX_REFRESH_TOKENS, remove oldest
    while (userDoc.refreshTokens.length >= maxRefreshTokens) userDoc.refreshTokens.shift();    // Leave space for new

    // Push new token
    userDoc.refreshTokens.push({
        tokenHash: refreshTokenHash,
        createdAt: new Date(),
        expiresAt: new Date(now + refreshTokenTtlMs),
        ip: req.ip,
        userAgent: req.get("user-agent")
    });
};


module.exports = {
    hashRefreshToken,
    addRefreshToken
};