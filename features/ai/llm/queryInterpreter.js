const { queryInterpretationSchema } = require("../ai.schemas");
const { normalizeAndTokenize } = require("../../../utils/nlp/tokenizer");
const AppError = require("../../../utils/AppError");
const { uniqueKeywords } = require("../../../utils/nlp/keywords");


const interpretQueryForRetrieval = async (gemini, message) => {
    const prompt = `
    You are helping a bookstore retrieval system understand a user's search intent.

    Your task:
    - Extract the main topics the user wants into includeKeywords
    - Extract the topics the user does NOT want into excludeKeywords
    - Choose searchMode:
    - "focused" if the request is specific
    - "broad" if the request is vague or exploratory

    Rules:
    - Return only a JSON object
    - Do not include markdown
    - Keep keywords short and useful for search
    - Do not include filler words
    - If there are no exclusions, return an empty excludeKeywords array

    User message:
    ${message.trim()}
    `;


    const response = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: queryInterpretationSchema
        }
    });

    const rawText = response?.text?.trim();

    let parsed;

    try {
        parsed = JSON.parse(rawText);
    }
    catch {
        throw new AppError("AI returned an invalid query interpretation format.", 500);
    }

    if (!parsed?.includeKeywords || !Array.isArray(parsed?.includeKeywords) || !parsed?.excludeKeywords || !Array.isArray(parsed?.excludeKeywords) || !parsed?.searchMode || typeof parsed?.searchMode !== "string") {
        throw new AppError("AI returned an invalid query interpretation structure.", 500);
    }

    return {
        includeKeywords: uniqueKeywords(parsed.includeKeywords.map(keyword => normalizeAndTokenize(keyword)).flat()),
        excludeKeywords: uniqueKeywords(parsed.excludeKeywords.map(keyword => normalizeAndTokenize(keyword)).flat()),
        searchMode: parsed.searchMode
    };
};


module.exports = { interpretQueryForRetrieval };