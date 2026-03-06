const Order = require("../../DB/models/order");


const getAll = async () => {
    const allOrders = await Order.find();
    return allOrders;
};

const getById = async (orderId) => {
    const targetOrder = await Order.findById(orderId);
    return targetOrder;
};

const getByUserId = async (userId) => {
    const targetOrders = await Order.find({ userId });
    return targetOrders;
};

const create = async (orderData) => {
    const newOrder = new Order(orderData);
    return await newOrder.save();
};

const update = async (orderId, updates) => {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { $set: updates }, { new: true, runValidators: true });
    return updatedOrder;
};

const deleteById = async (orderId) => {
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    return deletedOrder;
};


module.exports = {
    getAll,
    getById,
    getByUserId,
    create,
    update,
    deleteById
};