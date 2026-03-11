const handleAsyncError = require("../../middlewares/handleAsyncError");
const AppError = require("../../utils/AppError");
const orderService = require("./ordersService");


const getAllOrdersController = handleAsyncError(async (req, res) => {
    const allOrders = await orderService.getAllOrders();

    res.status(200).json({
        success: true,
        orders: allOrders
    });
});


const getOrderController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const targetOrder = await orderService.getOrder(id, req.currentUser);

    res.status(200).json({
        success: true,
        order: targetOrder
    });
});


const getMyOrdersController = handleAsyncError(async (req, res) => {
    const { id } = req.currentUser;

    const targetOrders = await orderService.getMyOrders(id);

    res.status(200).json({
        success: true,
        orders: targetOrders
    });
});


const createOrderController = handleAsyncError(async (req, res) => {
    const { id } = req.currentUser; // Self-service endpoint
    const { items } = req.body;

    if (!items) throw new AppError("Items are required.", 400);    // HTTP-level validation
    if (!Array.isArray(items)) throw new AppError("Items must be an array.", 400);  // HTTP-level validation

    const createdOrder = await orderService.createOrder(id, items);

    res.status(201).json({
        success: true,
        order: createdOrder
    });
});


const updateOrderStatusController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!req.body.status) throw new AppError("Status is required.", 400); // HTTP-level validation

    const updatedOrder = await orderService.updateOrderStatus(id, req.body.status);

    res.status(200).json({
        success: true,
        order: updatedOrder
    });
});


const deleteOrderController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const deletedOrder = await orderService.deleteOrder(id);

    res.status(200).json({
        success: true,
        order: deletedOrder
    });
});


module.exports = {
    getAllOrdersController,
    getOrderController,
    getMyOrdersController,
    createOrderController,
    updateOrderStatusController,
    deleteOrderController
};