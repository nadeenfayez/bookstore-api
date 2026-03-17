const { DBType } = require("../../configs/envConfigs");
const gemini = require("../../configs/gemini");
const { Type } = require("@google/genai");
const AppError = require("../../utils/AppError");


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

    await booksRepo.update(bookId, { aiSummary: parsed.summary.trim() });

    return {
        book: {
            id: book.id,
            title: book.title,
            author: book.author
        },
        summary: parsed.summary.trim()
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
            const book = candidateBooks.find(book => book.id == rec.id);

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

    await aiCacheRepo.create({ sourceBookId: sourceBook.id, recommendedBooks });

    return {
        sourceBook: {
            id: sourceBook.id,
            title: sourceBook.title,
            author: sourceBook.author
        },
        recommendations: recommendedBooks
    };
};


const chatWithBookstore = async (message) => {
    const books = await booksRepo.getAllActive();

    if (books.length === 0) throw new AppError("No active books available in the store.", 404);

    const compactCatalog = books.map(book => `
        ID: ${book.id}
        Title: ${book.title}
        Author: ${book.author || "Unknown"}
        Description: ${book.description || "No description available"}
        `).join("\n---\n");


    const prompt = `
    You are a bookstore recommendation assistant.

    A user is asking for book recommendations from this bookstore.
    Your job is to answer the user's request using ONLY the books in the catalog below.

    User message:
    ${message.trim()}

    Your task:
    - Understand what the user wants
    - Recommend only books from the catalog below
    - Choose only books that are genuinely relevant
    - Do not mention unrelated books
    - Do not give a general store introduction
    - Answer the user's request directly
    - If the request is about a topic, choose only books that clearly match that topic
    - Be helpful and concise
    - If no books are a strong match, clearly say so

    Rules:
    - Return only valid book IDs from the catalog
    - Do not invent books
    - Do not include markdown
    - matchedBookIds must contain only relevant books
    - If no books match, return an empty matchedBookIds array

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
        .filter(id => availableBooksIds.includes(id));

    const matchedBooks = books.filter(book => matchedBookIds.includes(book.id))
        .map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price
        }));

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