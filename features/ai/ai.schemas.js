const { Type } = require("@google/genai");


const bookSummarySchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING
        }
    },
    required: ["summary"]
};

const recommendationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: {
                type: Type.STRING
            },
            reason: {
                type: Type.STRING
            }
        },
        required: ["id", "reason"]
    }
};

const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        answer: {
            type: Type.STRING
        },
        matchedBookIds: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["answer", "matchedBookIds"]
};

const queryInterpretationSchema = {
    type: Type.OBJECT,
    properties: {
        includeKeywords: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            }
        },
        excludeKeywords: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            }
        },
        searchMode: {
            type: Type.STRING,
            enum: ["focused", "broad"]
        }
    },
    required: ["includeKeywords", "excludeKeywords", "searchMode"]
};


module.exports = {
    bookSummarySchema,
    recommendationSchema,
    chatResponseSchema,
    queryInterpretationSchema
};