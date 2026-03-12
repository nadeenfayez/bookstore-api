const Order = require("../../DB/models/order");


const getAll = async () => {
    const allOrders = await Order.find();
    return allOrders;
};

const getById = async (orderId, session = null) => {
    const targetOrder = await Order.findById(orderId).session(session);
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

const update = async (orderId, updates, session = null) => {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { $set: updates }, { new: true, runValidators: true, session });
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