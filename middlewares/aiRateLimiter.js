const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../configs/redis");


const createAiRateLimiter = ({ windowMs, max, message }) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: true,
            message
        },
        store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args)
        })
    });
};


const aiSummaryLimiter = createAiRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many summary requests. Please try again later."
});

const aiRecommendationsLimiter = createAiRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many recommendation requests. Please try again later."
});

const aiChatLimiter = createAiRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many chat requests. Please try again later."
});


module.exports = {
    aiSummaryLimiter,
    aiRecommendationsLimiter,
    aiChatLimiter
};