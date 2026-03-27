const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { redisClient } = require("../configs/redis");


const createAiRateLimiter = ({ windowMs, max, message, prefix }) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.currentUser?.id ? `user:${req.currentUser.id}` : `ip:${ipKeyGenerator(req.ip)}`,
        message: {
            success: false,
            message
        },
        store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix
        })
    });
};


const aiSummaryLimiter = createAiRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many summary requests. Please try again later.",
    prefix: "rl:ai:summary:"
});

const aiRecommendationsLimiter = createAiRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many recommendation requests. Please try again later.",
    prefix: "rl:ai:recommendations:"
});

const aiChatLimiter = createAiRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many chat requests. Please try again later.",
    prefix: "rl:ai:chat:"
});


module.exports = {
    aiSummaryLimiter,
    aiRecommendationsLimiter,
    aiChatLimiter
};