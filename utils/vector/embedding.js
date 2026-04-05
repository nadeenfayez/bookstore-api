const buildBookEmbeddingText = (book) => {
    return `
        Title: ${book.title}
        Author: ${book.author || "Unknown"}
        Description: ${book.description || "No description available"}
    `;
};


const createEmbedding = async (gemini, text) => {
    const response = await gemini.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text
    });

    return response.embeddings[0].values;
};


const cosineSimilarity = (a, b) => {
    if (!a || !b || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));  // This normalizes the result so it’s always between -1 → 1
};


module.exports = {
    buildBookEmbeddingText,
    createEmbedding,
    cosineSimilarity
};