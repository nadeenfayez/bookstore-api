const { DBType, stripeSecretKey, clientUrl } = require("../../configs/envConfigs");
const AppError = require("../../utils/AppError");

const paymentRepo = DBType === "mongo"
    ? require("./paymentsRepository.mongo")
    : require("./paymentRepository.fs");

const ordersRepo = DBType === "mongo"
    ? require("../orders/ordersRepository.mongo")
    : require("../orders/ordersRepository.fs");

const stripe = require("stripe")(stripeSecretKey);


// const mapPayment = (dbPayment) => ({
//     id: dbPayment.id,
//     title: dbPayment.title,
//     author: dbPayment.author,
// });


const getAllPayments = async () => {
    return await paymentRepo.getAll();
};


const getPayment = async (paymentId, currentUser) => {
    const existingPayment = await paymentRepo.getById(paymentId);

    if (!existingPayment) throw new AppError("Payment is not found.", 404);

    const isAdmin = currentUser.role === "admin";
    const isOwner = String(existingPayment.userId) === String(currentUser.id);

    if (!isAdmin && !isOwner) throw new AppError("Forbidden.", 403);

    return existingPayment;
};

const getMyPayments = async (userId) => {
    const existingPayments = await paymentRepo.getByUserId(userId);

    return existingPayments;
};


const createCheckoutSession = async (orderId, currentUser) => {
    const existingOrder = await ordersRepo.getById(orderId);

    if (!existingOrder) throw new AppError("Order is not found.", 404);

    const isAdmin = currentUser.role === "admin";
    const isOwner = String(existingOrder.userId) === String(currentUser.id);

    if (!isAdmin && !isOwner) throw new AppError("Forbidden.", 403);

    if (existingOrder.status !== "pending") throw new AppError("Only pending orders can be paid.", 409);

    const existingPayment = await paymentRepo.getByOrderId(existingOrder._id);

    if (existingPayment) throw new AppError("Payment already exists for this order.", 409);

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: existingOrder.items.map(item => ({
            price_data: {
                currency: item.price.currency.toLowerCase(),
                product_data: { name: item.title },
                unit_amount: Math.round(item.price.amount * 100)
            },
            quantity: item.quantity
        })),
        success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/payment-cancel`,
        client_reference_id: String(existingOrder._id),
        metadata: {
            orderId: String(existingOrder._id),
            userId: String(existingOrder.userId)
        }
    });

    const createdPayment = await paymentRepo.create({
        orderId: existingOrder._id,
        userId: existingOrder.userId,
        provider: "stripe",
        status: "pending",
        totalPrice: existingOrder.totalPrice,
        checkoutSessionId: session.id
    });

    return {
        payment: createdPayment,
        checkoutUrl: session.url,
        checkoutSessionId: session.id
    }
};


const updatePaymentStatus = async (paymentId, newStatus) => {
    const existingPayment = await paymentRepo.getById(paymentId);

    if (!existingPayment) throw new AppError("Payment is not found.", 404);

    // Prevent changing paid orders back to pending, etc.
    if (existingPayment.status === "paid") throw new AppError("Paid orders cannot be modified.", 409);

    const updatedPayment = await paymentRepo.update({ status: newStatus });

    return updatedPayment;
};


const deletePayment = async (paymentId) => {
    const existingPayment = await paymentRepo.getById(paymentId);

    if (!existingPayment) throw new AppError("Payment is not found.", 404);

    const deletedPayment = await paymentRepo.deleteById(paymentId);

    return deletedPayment;
};


module.exports = {
    getAllPayments,
    getPayment,
    getMyPayments,
    createCheckoutSession,
    updatePaymentStatus,
    deletePayment
};