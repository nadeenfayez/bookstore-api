const { DBType } = require("../../configs/envConfigs");
const gemini = require("../../configs/gemini");
const AppError = require("../../utils/AppError");


const booksRepo = DBType === "mongo"
    ? require("../books/booksRepository.mongo")
    : require("../books/booksRepository.fs");


const generateBookSummary = async (bookId) => {
    const existingBook = await booksRepo.getById(bookId);

    if (!existingBook) throw new AppError("Book is not found.", 404);

    if (!existingBook.isActive) throw new AppError("Book is not available.", 404);

    if (!existingBook.description) throw new AppError("This book does not have a description to summarize.", 400);


    const prompt = `
    You are a helpful bookstore assistant.

    Write a clear, engaging summary for the following book.
    Keep it between 50 and 100 words.
    Do not use bullet points.
    Do not mention that you are an AI.

    Title: ${existingBook.title}
    Author: ${existingBook.author || "Unknown"}
    Description: ${existingBook.description}
    `;

    const response = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
    });

    return {
        book: {
            id: existingBook.id,
            title: existingBook.title,
            author: existingBook.author
        },
        summary: response?.text?.trim()
    };
};


const recommendBooksByBookId = async (bookId) => {
    const sourceBook = await booksRepo.getById(bookId);

    if (!sourceBook) throw new AppError("Book is not found.", 404);

    if (!sourceBook.isActive) throw new AppError("Book is not available.", 404);

    if (!sourceBook.description) throw new AppError("This book does not have a description for recommendations.", 400);

    const candidateBooks = await booksRepo.getActiveExcludingId(bookId);

    if (candidateBooks.length === 0) throw new AppError("No candidate books available for recommendations.", 404);

    const candidatesText = candidateBooks.map(book => `
        ID: ${book._id}
        Title: ${book.title}
        Author: ${book.author || "Unknown"}
        Description: ${book.description || "No description available"}
        `).join("\n---\n");

    console.log("candidatesText", candidatesText);


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
    - Return only a JSON array
    - Each item must contain only: id
    - Do not include explanations
    - Do not include markdown
    - Do not invent IDs

    Candidate books:
    ${candidatesText}
    `;

    const response = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
    });

    const rawText = response?.text?.trim();
    console.log("rawText", rawText);

    let parsed;

    try {
        parsed = JSON.parse(rawText);
    }
    catch {
        throw new AppError("AI returned an invalid recommendation format.", 500);
    }

    if (!Array.isArray(parsed)) throw new AppError("AI returned an invalid recommendation structure.", 500);

    const recommendedIds = parsed.map(item => item?.id).filter(Boolean);

    const recommendedBooks = candidateBooks
        .filter(book => recommendedIds.includes(book.id))
        .slice(0, 3)
        .map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price
        }));

    return {
        sourceBook: {
            id: sourceBook.id,
            title: sourceBook.title,
            author: sourceBook.author
        },
        recommendations: recommendedBooks
    };
};


module.exports = {
    generateBookSummary,
    recommendBooksByBookId
};