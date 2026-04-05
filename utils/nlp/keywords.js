const uniqueKeywords = (keywords) => {
    return [...new Set(keywords)];
};


module.exports = { uniqueKeywords };