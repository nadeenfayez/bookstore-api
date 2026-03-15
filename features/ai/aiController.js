const handleAsyncError = require("../../middlewares/handleAsyncError");
const AppError = require("../../utils/AppError");
const aiService = require("./aiService");


const generateBookSummaryByBookIdController = handleAsyncError(async (req, res) => {
    const bookId = req.params.id;

    const result = await aiService.generateBookSummary(bookId);

    res.status(200).json({
        success: true,
        book: result.book,
        summary: result.summary
    });
});


const recommendBooksByBookIdController = handleAsyncError(async (req, res) => {
    const bookId = req.params.id;

    const result = await aiService.recommendBooksByBookId(bookId);

    res.status(200).json({
        success: true,
        sourceBook: result.sourceBook,
        recommendations: result.recommendations
    });
});


module.exports = {
    generateBookSummaryByBookIdController,
    recommendBooksByBookIdController
};