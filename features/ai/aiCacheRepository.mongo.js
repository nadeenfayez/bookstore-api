const AiCache = require("../../DB/models/aiCache");


const getByBookId = async (bookId) => {
    return await AiCache.findOne({ sourceBookId: bookId });
};

const create = async (aiData) => {
    const newAiCache = new AiCache(aiData);
    return await newAiCache.save();
};


module.exports = {
    getByBookId,
    create
};