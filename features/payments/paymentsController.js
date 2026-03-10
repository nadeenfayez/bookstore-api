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


const handleStripeWebhookController = async (req, res) => {
    try {
        const signature = req.headers["stripe-signature"];

        if (!signature) throw new AppError("Missing Stripe signature.", 400);   // HTTP-level validation

        await paymentService.handleStripeWebhook(req.body, signature);

        res.sendStatus(200);
    }
    catch (err) {
        console.error("Webhook error:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};


const updatePaymentStatusController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!req.body?.status) throw new AppError("Status is required.", 400);  // HTTP-level validation

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
    handleStripeWebhookController,
    updatePaymentStatusController,
    deletePaymentController
};