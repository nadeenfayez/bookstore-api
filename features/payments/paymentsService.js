const { DBType, stripeSecretKey, clientUrl, stripeWebhookSecret } = require("../../configs/envConfigs");
const stripe = require("stripe")(stripeSecretKey);
const mongoose = require("mongoose");
const AppError = require("../../utils/AppError");

const paymentsRepo = DBType === "mongo"
    ? require("./paymentsRepository.mongo")
    : require("./paymentsRepository.fs");

const ordersRepo = DBType === "mongo"
    ? require("../orders/ordersRepository.mongo")
    : require("../orders/ordersRepository.fs");

const booksRepo = DBType === "mongo"
    ? require("../books/booksRepository.mongo")
    : require("../books/booksRepository.fs");

const webhookEventsRepo = DBType === "mongo"
    ? require("./webhookEventsRepository.mongo")
    : require("./webhookEventsRepository.fs");

const usersRepo = DBType === "mongo"
    ? require("../users/usersRepository.mongo")
    : require("../users/usersRepository.fs");


// const mapPayment = (dbPayment) => ({
//     id: dbPayment.id,
//     title: dbPayment.title,
//     author: dbPayment.author,
// });


const markWebhookEventProcessed = async (eventId, session) => { // Helper
    await webhookEventsRepo.updateByEventId(eventId, { processed: true, processedAt: new Date() }, session);
};


const getAllPayments = async () => {
    return await paymentsRepo.getAll();
};


const getPayment = async (paymentId, currentUser) => {
    const existingPayment = await paymentsRepo.getById(paymentId);

    if (!existingPayment) throw new AppError("Payment is not found.", 404);

    const isAdmin = currentUser.role === "admin";
    const isOwner = String(existingPayment.userId) === String(currentUser.id);

    if (!isAdmin && !isOwner) throw new AppError("Forbidden.", 403);

    return existingPayment;
};


const getMyPayments = async (userId) => {
    const existingPayments = await paymentsRepo.getByUserId(userId);

    return existingPayments;
};


const createCheckoutSession = async (orderId, currentUser) => {
    const existingOrder = await ordersRepo.getById(orderId);

    if (!existingOrder) throw new AppError("Order is not found.", 404);

    const isAdmin = currentUser.role === "admin";
    const isOwner = String(existingOrder.userId) === String(currentUser.id);

    if (!isAdmin && !isOwner) throw new AppError("Forbidden.", 403);

    if (existingOrder.status !== "pending") throw new AppError("Only pending orders can be paid.", 409);

    const existingPayment = await paymentsRepo.getByOrderId(existingOrder._id);

    if (existingPayment) throw new AppError("Payment already exists for this order.", 409);

    const user = await usersRepo.getById(existingOrder.userId);

    const sessionData = {
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
    };

    if (user?.email) {
        sessionData.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    const createdPayment = await paymentsRepo.create({
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


const handleStripeWebhook = async (rawBody, signature) => {
    let event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
    }
    catch (err) {
        console.error("Stripe webhook verification error:", err.message);
        throw new AppError(`Stripe webhook signature verification failed: ${err.message}`, 400);
    }

    const dataObject = event.data.object;

    await mongoose.connection.transaction(async (session) => {

        const existingWebhookEvent = await webhookEventsRepo.getByEventId(event.id, session);

        if (existingWebhookEvent?.processed) return;    // Idempotency check for duplicate webhook deliveries

        if (!existingWebhookEvent) await webhookEventsRepo.create({ eventId: event.id, type: event.type, provider: "stripe", orderId: dataObject.metadata?.orderId || undefined, processed: false }, session);

        switch (event.type) {
            case "checkout.session.completed": {
                const orderId = dataObject.metadata?.orderId;

                if (!orderId) throw new AppError("Order id is missing from Stripe session metadata.", 400);

                const existingPayment = await paymentsRepo.getByOrderId(orderId, session);

                if (!existingPayment) throw new AppError("Payment is not found for this order.", 404);

                const existingOrder = await ordersRepo.getById(orderId, session);

                if (!existingOrder) throw new AppError("Order is not found.", 404);

                // idempotency: if already paid, do nothing
                if (existingPayment.status === "paid" && existingOrder.status === "paid") {
                    await markWebhookEventProcessed(event.id, session);

                    return;
                }

                const targetedBooks = [];

                // Validation of the stock first
                for (const item of existingOrder.items) {
                    const book = await booksRepo.getById(item.bookId, session);

                    if (!book) throw new AppError(`Book is not found for item ${item.bookId}.`, 404);

                    if (book.stockQty < item.quantity) throw new AppError(`Not enough stock for "${book.title}".`, 409);

                    targetedBooks.push(book);
                }

                // Preparing updates
                const stockUpdates = [];

                for (let i = 0; i < existingOrder.items.length; i++) {
                    const item = existingOrder.items[i];
                    const book = targetedBooks[i];

                    stockUpdates.push({
                        bookId: book._id,
                        newStockQty: book.stockQty - item.quantity
                    });
                }

                // Reduce stock after all validations pass
                await booksRepo.bulkUpdateStock(stockUpdates, session);

                // Mark payment/order as paid
                if (existingPayment.status !== "paid") await paymentsRepo.update(existingPayment._id, { status: "paid" }, session);

                if (existingOrder.status !== "paid") await ordersRepo.update(orderId, { status: "paid" }, session);

                await markWebhookEventProcessed(event.id, session);

                return;
            }

            case "checkout.session.expired": {
                const orderId = dataObject.metadata?.orderId;

                if (!orderId) {
                    await markWebhookEventProcessed(event.id, session);

                    return;
                }

                const existingPayment = await paymentsRepo.getByOrderId(orderId, session);

                if (existingPayment && existingPayment.status === "pending") await paymentsRepo.update(existingPayment._id, { status: "failed" }, session);

                const existingOrder = await ordersRepo.getById(orderId, session);

                if (existingOrder && existingOrder.status === "pending") await ordersRepo.update(orderId, { status: "failed" }, session);

                await markWebhookEventProcessed(event.id, session);

                return;
            }

            default: {
                console.log(`Unhandled event type ${event.type}`);

                await markWebhookEventProcessed(event.id, session);

                return;
            }
        }
    });
};

// Deleted because stripe webhook is the only source of the truth
// const updatePaymentStatus = async (paymentId, newStatus) => {
//     const allowedStatus = ["pending", "paid", "failed"];

//     if (!allowedStatus.includes(newStatus)) throw new AppError("Invalid status.", 400);

//     const existingPayment = await paymentsRepo.getById(paymentId);

//     if (!existingPayment) throw new AppError("Payment is not found.", 404);

//     // Prevent changing paid payments back to pending, etc.
//     if (existingPayment.status === "paid") throw new AppError("Paid payments cannot be modified.", 409);

//     const updatedPayment = await paymentsRepo.update(paymentId, { status: newStatus });

//     return updatedPayment;
// };


const deletePayment = async (paymentId) => {
    const existingPayment = await paymentsRepo.getById(paymentId);

    if (!existingPayment) throw new AppError("Payment is not found.", 404);

    // Prevent deleting paid payments
    if (existingPayment.status === "paid") throw new AppError("Paid payments cannot be deleted.", 409);

    const deletedPayment = await paymentsRepo.deleteById(paymentId);

    return deletedPayment;
};


module.exports = {
    getAllPayments,
    getPayment,
    getMyPayments,
    createCheckoutSession,
    handleStripeWebhook,
    deletePayment
};