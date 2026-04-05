const { cosineSimilarity } = require("../../../utils/vector/embedding");


const getEmbeddingRetrievalScores = (allActiveBooks, queryEmbedding) => {
    if (allActiveBooks.length === 0) return { items: [], usedFallback: false };

    const scoredBooks = allActiveBooks.map(book => ({
        book,
        similarity: Array.isArray(book.aiEmbedding) && book.aiEmbedding.length > 0 ? cosineSimilarity(queryEmbedding, book.aiEmbedding) : 0
    }));

    const hasAnyEmbedding = scoredBooks.some(item => item.similarity > 0);

    return { items: scoredBooks, usedFallback: !hasAnyEmbedding };
};


module.exports = { getEmbeddingRetrievalScores };