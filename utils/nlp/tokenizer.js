const natural = require("natural");
const { removeStopwords } = require("stopword");

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const customStopWords = new Set(["want", "wanna", "need", "give", "show", "find", "book", "books", "hi", "please"]);

const normalizeAndTokenize = (text) => {
    const tokens = tokenizer.tokenize((text || "").toLowerCase())
        .map(token => token.trim())
        .filter(Boolean)
        .filter(token => token.length > 2);

    const filteredTokens = removeStopwords(tokens).filter(token => !customStopWords.has(token));

    return filteredTokens.map(token => stemmer.stem(token));
};


module.exports = { normalizeAndTokenize };