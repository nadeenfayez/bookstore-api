const gemini = require("../../configs/gemini");
const AppError = require("../../utils/AppError");


// const mapAccessTokenPayload = (dbUser) => ({
//     sub: dbUser._id,
//     role: dbUser.role
// });


const generateBookSummary = async (title, description) => {
    const prompt = `
    You are a helpful bookstore assistant.

    Write a clear, engaging summary for the following book.
    Keep it between 50 and 100 words.
    Do not use bullet points.
    Do not mention that you are an AI.

    Title: ${title}
    Description: ${description}
    `;

    const response = await gemini.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt
    });

    return response?.text?.trim();
};


module.exports = {
    generateBookSummary
};