const { createClient } = require("redis");
const { redisUrl } = require("./envConfigs");

const redisClient = createClient({
    url: redisUrl
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));


module.exports = redisClient;