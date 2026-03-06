const { DBType } = require("../../configs/envConfigs");
const AppError = require("../../utils/AppError");

const ordersRepo = DBType === "mongo"
    ? require("./ordersRepository.mongo")
    : require("./ordersRepository.fs");

const booksRepo = DBType === "mongo"
    ? require("../books/booksRepository.mongo")
    : require("../books/booksRepository.fs");


// const mapOrder = (dbOrder) => ({
//     id: dbOrder.id,
//     title: dbOrder.title,
//     author: dbOrder.author,
// });


const getAllOrders = async () => {
    return await ordersRepo.getAll();
};


const getOrder = async (orderId, currentUser) => {
    const existingOrder = await ordersRepo.getById(orderId);

    if (!existingOrder) throw new AppError("Order is not found.", 404);

    const isAdmin = currentUser.role === "admin";
    const isOwner = String(existingOrder.userId) === String(currentUser.id);

    if (!isAdmin && !isOwner) throw new AppError("Forbidden.", 403);

    return existingOrder;
};

const getMyOrders = async (userId) => {
    const existingOrders = await ordersRepo.getByUserId(userId);

    return existingOrders;
};


const createOrder = async (userId, items) => {
    if (items.length === 0) throw new AppError("Order must contain at least one item.", 400);

    for (const item of items) {
        if (!item.bookId) throw new AppError("Book id is required.", 400);
    }

    let bookIds = items.map(b => b.bookId);

    let books = await booksRepo.getActiveByIds(bookIds);

    if (books.length !== bookIds.length) throw new AppError("Some books were not found.", 404);

    // Build order items + calculate total
    let totalAmount = 0;

    const orderItems = items.map(i => {
        const book = books.find(b => String(b._id) === String(i.bookId));

        const quantity = i.quantity ?? 1;

        if (quantity < 1) throw new AppError("Quantity must be >= 1.", 400);

        if (book.stockQty < quantity) throw new AppError(`Not enough stock for "${book.title}".`, 409);

        totalAmount += book.price.amount * quantity;

        return {
            bookId: book._id,
            title: book.title,  // Snapshot
            price: book.price,  // Snapshot
            quantity
        }
    });

    const orderCurrency = books[0].price.currency;  // All books in the order expected to have the same currency

    const createdOrder = await ordersRepo.create({ userId, items: orderItems, totalPrice: { amount: totalAmount, currency: orderCurrency }, status: "pending" });

    return createdOrder;
};


const updateOrder = async (orderId, status) => {
    const allowedStatus = ["pending", "paid", "failed"];

    if (!allowedStatus.includes(status)) throw new AppError("Invalid status.", 400);

    const existingOrder = await ordersRepo.getById(orderId);

    if (!existingOrder) throw new AppError("Order is not found.", 404);

    // Prevent changing paid orders back to pending, etc.
    if (existingOrder.status === "paid") throw new AppError("Paid orders cannot be modified.", 409);

    const updatedOrder = await ordersRepo.update(orderId, { status });

    return updatedOrder;
};


const deleteOrder = async (orderId) => {
    const existingOrder = await ordersRepo.getById(orderId);

    if (!existingOrder) throw new AppError("Order is not found.", 404);

    const deletedOrder = await ordersRepo.deleteById(orderId);

    return deletedOrder;
};


module.exports = {
    getAllOrders,
    getOrder,
    getMyOrders,
    createOrder,
    updateOrder,
    deleteOrder
};