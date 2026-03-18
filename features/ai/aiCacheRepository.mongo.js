const AiCache = require("../../DB/models/aiCache");


const getByBookId = async (bookId) => {
    return await AiCache.findOne({ sourceBookId: bookId });
};

const upsertByBookId = async (bookId, aiData) => {
    return await AiCache.findOneAndUpdate({ sourceBookId: bookId }, { $set: aiData }, { new: true, upsert: true, runValidators: true });
};

const deleteByBookId = async (bookId) => {
    return await AiCache.findOneAndDelete({ sourceBookId: bookId });
};


module.exports = {
    getByBookId,
    upsertByBookId,
    deleteByBookId
};