const { DBType } = require("../../configs/envConfigs");
const gemini = require("../../configs/gemini");
const { Type } = require("@google/genai");
const AppError = require("../../utils/AppError");
const { getChatMemory, addChatMessage } = require("../../utils/chatMemory");
const { redisClient } = require("../../configs/redis");


const booksRepo = DBType === "mongo"
    ? require("../books/booksRepository.mongo")
    : require("../books/booksRepository.fs");

const aiCacheRepo = DBType === "mongo"
    ? require("./aiCacheRepository.mongo")
    : require("./aiCacheRepository.fs");


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

const extractKeywords = (message) => {
    const stopWords = new Set(["i", "me", "my", "you", "they", "them", "these", "those", "a", "an", "the", "and", "or", "but",
        "about", "for", "with", "to", "of", "in", "on", "at", "is",
        "are", "was", "were", "be", "want", "need", "give", "show",
        "find", "book", "books", "something", "anything", "hi", "please", "more", "less", "much"]);

    return message.toLowerCase()
        .split(/\W+/)
        .map(word => word.trim())
        .filter(word => word.length > 2)
        .filter(word => !stopWords.has(word));
};

const scoreBookAgainstKeywords = (book, keywords) => {
    let score = 0;
    let matchedKeywordsCount = 0;

    const title = (book.title || "").toLowerCase();
    const author = (book.author || "").toLowerCase();
    const description = (book.description || "").toLowerCase();

    for (const keyword of keywords) {
        let keywordMatched = false;

        if (title.includes(keyword)) {
            score += 3;
            keywordMatched = true;
        }
        if (description.includes(keyword)) {
            score += 2;
            keywordMatched = true;
        }
        if (author.includes(keyword)) {
            score += 1;
            keywordMatched = true;
        }

        if (keywordMatched) matchedKeywordsCount += 1;
    }

    // Bonus for matching multiple different keywords
    if (matchedKeywordsCount >= 2) score += 2;

    if (matchedKeywordsCount >= 3) score += 2;

    return {
        score,
        matchedKeywordsCount
    };
};

const retrieveCandidateBooks = async (message) => {
    const keywords = extractKeywords(message);

    const allActiveBooks = await booksRepo.getAllActive();

    if (allActiveBooks.length === 0) return [];

    if (keywords.length === 0) return allActiveBooks.slice(0, 10);

    const scoredBooks = allActiveBooks.map(book => {
        const { score, matchedKeywordsCount } = scoreBookAgainstKeywords(book, keywords);

        console.log({
            title: book.title,
            score,
            matchedKeywordsCount
        });

        return {
            book,
            score,
            matchedKeywordsCount
        };
    })
        .filter(item => item.score > 0)
        .sort((a, b) => {
            if (a.score !== b.score) return b.score - a.score;

            // Tie-breaker: more matched keywords wins
            return b.matchedKeywordsCount - a.matchedKeywordsCount;
        })
        .map(item => item.book);

    if (scoredBooks.length === 0) return allActiveBooks.slice(0, 10);   // Limit the candidate set

    return scoredBooks.slice(0, 10);    // Limit the candidate set
};


const generateBookSummary = async (bookId) => {
    const book = await booksRepo.getById(bookId);

    if (!book) throw new AppError("Book is not found.", 404);

    if (!book.isActive) throw new AppError("Book is not available.", 404);

    if (!book.description) throw new AppError("This book does not have a description to summarize.", 400);

    if (book.aiSummary) {
        return {
            book: {
                id: book.id,
                title: book.title,
                author: book.author
            },
            summary: book.aiSummary
        };
    }


    const prompt = `
    You are a helpful bookstore assistant.

    Write a clear, engaging summary for the following book.
    Keep it between 50 and 100 words.
    Do not use bullet points.
    Do not mention that you are an AI.
    Return only a JSON object.
    Each JSON object must contain only: summary

    Title: ${book.title}
    Author: ${book.author || "Unknown"}
    Description: ${book.description}
    `;


    const response = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: bookSummarySchema
        }
    });

    const rawText = response?.text?.trim();

    let parsed;

    try {
        parsed = JSON.parse(rawText);
    }
    catch {
        throw new AppError("AI returned an invalid summary format.", 500);
    }

    if (!parsed?.summary || typeof parsed?.summary !== "string") throw new AppError("AI returned an invalid summary structure.", 500);

    const summary = parsed.summary.trim();

    await booksRepo.update(bookId, { aiSummary: summary });

    return {
        book: {
            id: book.id,
            title: book.title,
            author: book.author
        },
        summary
    };
};


const recommendBooksByBookId = async (bookId) => {
    const sourceBook = await booksRepo.getById(bookId);

    if (!sourceBook) throw new AppError("Book is not found.", 404);

    if (!sourceBook.isActive) throw new AppError("Book is not available.", 404);

    if (!sourceBook.description) throw new AppError("This book does not have a description for recommendations.", 400);

    const candidateBooks = await booksRepo.getActiveExcludingId(bookId);

    if (candidateBooks.length === 0) throw new AppError("No candidate books available for recommendations.", 404);

    const aiCache = await aiCacheRepo.getByBookId(bookId);

    if (aiCache) {
        const candidateBooksIds = candidateBooks.map(book => book.id);

        const validRecommendations = aiCache.recommendedBooks
            .filter(rec => candidateBooksIds.includes(String(rec.id)));

        const recommendedBooks = validRecommendations.map(rec => {
            const book = candidateBooks.find(book => book.id === String(rec.id));

            return {
                id: book.id,
                title: book.title,
                author: book.author,
                price: book.price,
                reason: rec.reason
            }
        });

        return {
            sourceBook: {
                id: sourceBook.id,
                title: sourceBook.title,
                author: sourceBook.author
            },
            recommendations: recommendedBooks
        };
    }

    const candidatesText = candidateBooks.map(book => `
        ID: ${book.id}
        Title: ${book.title}
        Author: ${book.author || "Unknown"}
        Description: ${book.description || "No description available"}
        `).join("\n---\n");


    const prompt = `
    You are a helpful bookstore recommendation assistant.

    A user is viewing this book:

    Source book:
    Title: ${sourceBook.title}
    Author: ${sourceBook.author || "Unknown"}
    Description: ${sourceBook.description}

    Below is a list of candidate books from the same bookstore.
    Choose the 3 most relevant recommendations for the source book.

    Rules:
    - Recommend only from the candidate books below
    - Return exactly 3 items when possible
    - Return only valid candidate IDs
    - Return only a JSON array
    - Each item must contain:
        - id
        - reason
    - The reason must be short and clear
    - Do not include explanations outside the JSON
    - Do not include markdown
    - Do not invent IDs

    Candidate books:
    ${candidatesText}
    `;


    const response = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: recommendationSchema
        }
    });

    const rawText = response?.text?.trim();

    let parsed;

    try {
        parsed = JSON.parse(rawText);
    }
    catch {
        throw new AppError("AI returned an invalid recommendation format.", 500);
    }

    if (!Array.isArray(parsed)) throw new AppError("AI returned an invalid recommendation structure.", 500);

    const candidateBooksIds = candidateBooks.map(book => book.id);

    const validRecommendations = parsed
        .filter(item => item?.id && item?.reason)
        .filter(item => candidateBooksIds.includes(item.id))
        .slice(0, 3);

    const recommendedBooks = validRecommendations.map(rec => {
        const book = candidateBooks.find(book => book.id === rec.id);

        return {
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price,
            reason: rec.reason
        }
    });

    await aiCacheRepo.upsertByBookId(sourceBook.id, { sourceBookId: sourceBook.id, recommendedBooks });

    return {
        sourceBook: {
            id: sourceBook.id,
            title: sourceBook.title,
            author: sourceBook.author
        },
        recommendations: recommendedBooks
    };
};


const chatWithBookstore = async (userId, message) => {
    const books = await retrieveCandidateBooks(message);

    if (books.length === 0) throw new AppError("No active books available in the store.", 404);

    const compactCatalog = books.map(book => `
        ID: ${book.id}
        Title: ${book.title}
        Author: ${book.author || "Unknown"}
        Description: ${book.description || "No description available"}
        `).join("\n---\n");

    const previousMessages = await getChatMemory(userId);

    const conversationHistory = previousMessages.length ?
        previousMessages.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n")
        : "No previous conversation.";

    const prompt = `
    You are a bookstore recommendation assistant.

    You are NOT a general AI assistant.
    You are restricted to the bookstore catalog only.

    A user is chatting with you about books from this bookstore.

    Previous conversation:
    ${conversationHistory}

    Current user message:
    ${message.trim()}

    IMPORTANT RULE (STRICT):
    - You MUST ONLY recommend books from the catalog below
    - DO NOT mention any book that is not in the catalog
    - DO NOT use your general knowledge
    - If no relevant books exist, say that clearly

    Your task:
    - Understand the current message in the context of the previous conversation
    - Recommend only books from the catalog
    - Choose ONLY the most relevant books
    - Prefer quality over quantity
    - Recommend at most 3 books
    - Do NOT include weak or loosely related matches
    - Answer the user directly and concisely
    - Do not include unnecessary explanation

    Rules:
    - Return only a JSON object
    - Do not include markdown
    - matchedBookIds must contain ONLY valid IDs from the catalog
    - Return at most 3 matchedBookIds
    - If no books match, return:
    {
        "answer": "No relevant books found in our store.",
        "matchedBookIds": []
    }

    Catalog:
    ${compactCatalog}
    `;


    const response = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: chatResponseSchema
        }
    });

    const rawText = response?.text?.trim();

    let parsed;

    try {
        parsed = JSON.parse(rawText);
    }
    catch {
        throw new AppError("AI returned an invalid chat response format.", 500);
    }

    if (!parsed?.answer || typeof parsed?.answer !== "string" || !parsed?.matchedBookIds || !Array.isArray(parsed.matchedBookIds)) throw new AppError("AI returned an invalid chat response structure.", 500);

    const availableBooksIds = books.map(book => book.id);

    const matchedBookIds = parsed.matchedBookIds
        .filter(Boolean)
        .filter(id => availableBooksIds.includes(id))
        .slice(0, 3);

    const matchedBooks = books.filter(book => matchedBookIds.includes(book.id))
        .map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price
        }));

    await addChatMessage(userId, { role: "user", content: message.trim() });

    await addChatMessage(userId, { role: "assistant", content: parsed.answer.trim() });

    return {
        answer: parsed.answer.trim(),
        matchedBooks
    };
};


module.exports = {
    generateBookSummary,
    recommendBooksByBookId,
    chatWithBookstore
};