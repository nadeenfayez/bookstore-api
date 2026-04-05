const { normalizeAndTokenize } = require("../../../utils/nlp/tokenizer");


const scoreBookAgainstKeywords = (book, includeKeywords, excludeKeywords) => {
    let score = 0;
    let matchedKeywordsCount = 0;

    const titleTokens = new Set(normalizeAndTokenize(book.title));
    const authorTokens = new Set(normalizeAndTokenize(book.author));
    const descriptionTokens = new Set(normalizeAndTokenize(book.description));

    const scoreKeywordMatch = (keyword, isNegative = false) => {
        let keywordMatched = false;

        if (titleTokens.has(keyword)) {
            keywordMatched = true;
            score += isNegative ? -3 : +3;
        }

        if (descriptionTokens.has(keyword)) {
            keywordMatched = true;
            score += isNegative ? -2 : +2;
        }

        if (authorTokens.has(keyword)) {
            keywordMatched = true;
            score += isNegative ? -1 : +1;
        }

        if (keywordMatched && !isNegative) matchedKeywordsCount += 1;
    };

    for (const keyword of includeKeywords) {
        scoreKeywordMatch(keyword, false);
    }

    for (const keyword of excludeKeywords) {
        scoreKeywordMatch(keyword, true);
    }

    // Bonus for matching multiple different keywords
    if (matchedKeywordsCount >= 2) score += 2;

    if (matchedKeywordsCount >= 3) score += 2;

    return {
        score,
        matchedKeywordsCount
    };
};


const getKeywordRetrievalScores = (allActiveBooks, queryIntent) => {
    const { includeKeywords, excludeKeywords, searchMode } = queryIntent;

    if (allActiveBooks.length === 0) return { items: [], usedFallback: false, searchMode };

    if (includeKeywords.length === 0 && excludeKeywords.length === 0) {
        return {
            items: allActiveBooks.map(book => ({
                book,
                keywordScore: 0,
                matchedKeywordsCount: 0
            })),
            usedFallback: true,
            searchMode
        };
    }

    const scoredBooks = allActiveBooks.map(book => {
        const { score, matchedKeywordsCount } = scoreBookAgainstKeywords(book, includeKeywords, excludeKeywords);

        return {
            book,
            keywordScore: score,
            matchedKeywordsCount
        };
    });

    const hasAnyKeywordMatch = scoredBooks.some(item => item.keywordScore > 0);

    return { items: scoredBooks, usedFallback: !hasAnyKeywordMatch, searchMode };
};


module.exports = { getKeywordRetrievalScores };