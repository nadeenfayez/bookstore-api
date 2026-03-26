const { createClient } = require("redis");
const { redisUrl } = require("./envConfigs");


const redisClient = createClient({
    url: redisUrl
});

// Connection events (for monitoring & debugging)
redisClient.on("connect", () => console.log("Redis connecting..."));
redisClient.on("ready", () => console.log("Redis ready."));
redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("end", () => console.log("Redis connection closed."));

// Connection function
const connectRedis = async () => {
    if (!redisClient.isOpen) await redisClient.connect();
};


module.exports = {
    redisClient,
    connectRedis
};