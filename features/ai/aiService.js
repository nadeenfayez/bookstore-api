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


module.exports = {
    generateBookSummary
};