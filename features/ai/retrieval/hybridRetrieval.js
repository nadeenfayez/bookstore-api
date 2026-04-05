const { nodeEnv } = require("../../../configs/envConfigs");

const retrieveCandidateBooksHybrid = (keywordResult, embeddingResult) => {
    if (keywordResult.items.length === 0 || embeddingResult.items.length === 0) return { items: [], usedFallback: false };

    const embeddingMap = new Map(
        embeddingResult.items.map(item => [item.book.id, item.similarity])
    );

    const maxKeywordScore = Math.max(...keywordResult.items.map(item => Math.max(item.keywordScore, 0)), 1);

    const hybridBooks = keywordResult.items.map(item => {
        const similarity = embeddingMap.get(item.book.id) || 0;

        const normalizedKeywordScore = Math.max(item.keywordScore, 0) / maxKeywordScore;

        const keywordWeight = 0.6;
        const semanticWeight = 0.4;

        const hybridScore = (normalizedKeywordScore * keywordWeight) + (similarity * semanticWeight);

        if (nodeEnv === "development") {
            console.log({
                title: item.book.title,
                keywordScore: item.keywordScore,
                normalizedKeywordScore,
                matchedKeywordsCount: item.matchedKeywordsCount,
                similarity,
                hybridScore
            });
        }

        return {
            book: item.book,
            keywordScore: item.keywordScore,
            matchedKeywordsCount: item.matchedKeywordsCount,
            similarity,
            hybridScore
        }
    })
        .sort((a, b) => {
            if (b.hybridScore !== a.hybridScore) return b.hybridScore - a.hybridScore;
            if (b.keywordScore !== a.keywordScore) return b.keywordScore - a.keywordScore;
            return b.similarity - a.similarity;
        });

    const searchMode = keywordResult.searchMode || "focused";

    const MIN_BASE_HYBRID_SCORE = searchMode === "broad" ? 0.18 : 0.25;
    const dynamicRatio = searchMode === "broad" ? 0.4 : 0.5;   // Keep books that are at least X% as good as the best one

    const topScore = hybridBooks[0]?.hybridScore || 0;
    const dynamicThreshold = Math.max(MIN_BASE_HYBRID_SCORE, topScore * dynamicRatio);


    const filteredHybridBooks = hybridBooks.filter(item => item.hybridScore >= dynamicThreshold);

    const noStrongHybridMatches = filteredHybridBooks.length === 0;
    const bothRetrieversFallback = keywordResult.usedFallback === true && embeddingResult.usedFallback === true;

    const usedFallback = bothRetrieversFallback || noStrongHybridMatches;

    return { items: usedFallback ? hybridBooks : filteredHybridBooks.slice(0, 10), usedFallback };
};


module.exports = { retrieveCandidateBooksHybrid };