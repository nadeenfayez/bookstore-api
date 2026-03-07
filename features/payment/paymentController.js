const handleAsyncError = require("../../middlewares/handleAsyncError");
const AppError = require("../../utils/AppError");
const paymentService = require("./paymentService");


const getAllPaymentsController = handleAsyncError(async (req, res) => {
    const allPayments = await paymentService.getAllPayments();

    res.status(200).json({
        success: true,
        payments: allPayments
    });
});


const getPaymentController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const targetPayment = await paymentService.getPayment(id, req.currentUser);

    res.status(200).json({
        success: true,
        payment: targetPayment
    });
});


const getMyPaymentsController = handleAsyncError(async (req, res) => {
    const { id } = req.currentUser;

    const targetPayments = await paymentService.getMyPayments(id);

    res.status(200).json({
        success: true,
        payments: targetPayments
    });
});


const createPaymentController = handleAsyncError(async (req, res) => {

});


const updatePaymentStatusController = handleAsyncError(async (req, res) => {

});


const deletePaymentController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const deletedPayment = await paymentService.deletePayment(id);

    res.status(200).json({
        success: true,
        payment: deletedPayment
    });
});


module.exports = {
    getAllPaymentsController,
    getPaymentController,
    getMyPaymentsController,
    createPaymentController,
    updatePaymentStatusController,
    deletePaymentController
};