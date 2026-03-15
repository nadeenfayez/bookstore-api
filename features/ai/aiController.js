const handleAsyncError = require("../../middlewares/handleAsyncError");
const AppError = require("../../utils/AppError");
const aiService = require("./aiService");


const generateBookSummaryController = handleAsyncError(async (req, res) => {
    const { title, description } = req.body || {};

    if (!title || !description) throw new AppError("Title and description are required.", 400); // HTTP-level validation


    const summary = await aiService.generateBookSummary(title, description);

    res.status(200).json({
        success: true,
        summary
    });
});


module.exports = {
    generateBookSummaryController
}