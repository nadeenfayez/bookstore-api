const { redisClient } = require("../configs/redis");


const CHAT_MEMORY_LIMIT = 6;
const CHAT_MEMORY_TTL_SECONDS = 30 * 60;

const getChatMemoryKey = (userId) => `chat:memory:${userId}`;

const getChatMemory = async (userId) => {
    const key = getChatMemoryKey(userId);

    const messages = await redisClient.lRange(key, 0, -1);  // Get all messages

    return messages.map((msg) => JSON.parse(msg));
};

const addChatMessage = async (userId, message) => {
    const key = getChatMemoryKey(userId);

    await redisClient.rPush(key, JSON.stringify(message));

    await redisClient.lTrim(key, -CHAT_MEMORY_LIMIT, -1);   // Keep only the latest 6 messages, delete older ones

    await redisClient.expire(key, CHAT_MEMORY_TTL_SECONDS);
};

const clearChatMemory = async (userId) => {
    const key = getChatMemoryKey(userId);

    await redisClient.del(key);
};

module.exports = {
    getChatMemory,
    addChatMessage,
    clearChatMemory
};