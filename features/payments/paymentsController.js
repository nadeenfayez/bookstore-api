const handleAsyncError = require("../../middlewares/handleAsyncError");
const AppError = require("../../utils/AppError");
const paymentService = require("./paymentsService");


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


const createCheckoutSessionController = handleAsyncError(async (req, res) => {
    const { orderId } = req.params;

    const checkoutData = await paymentService.createCheckoutSession(orderId, req.currentUser);

    res.status(201).json({
        success: true,
        ...checkoutData
    });
});


const updatePaymentStatusController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!req.body?.status) throw new AppError("Status is required.", 400);

    const updatedPayment = await paymentService.updatePaymentStatus(id, req.body.status);

    res.status(201).json({
        success: true,
        payment: updatedPayment
    });
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
    createCheckoutSessionController,
    updatePaymentStatusController,
    deletePaymentController
};