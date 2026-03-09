const Payment = require("../../DB/models/payment");


const getAll = async () => {
    const allPayments = await Payment.find();
    return allPayments;
};

const getById = async (paymentId) => {
    const targetPayment = await Payment.findById(paymentId);
    return targetPayment;
};

const getByUserId = async (userId) => {
    const targetPayments = await Payment.find({ userId });
    return targetPayments;
};

const getByOrderId = async (orderId) => {
    const targetPayment = await Payment.findOne({ orderId });
    return targetPayment;
};

const create = async (paymentData) => {
    const newPayment = new Payment(paymentData);
    return await newPayment.save();
};

const update = async (paymentId, updates) => {
    const updatedPayment = await Payment.findByIdAndUpdate(paymentId, { $set: updates }, { new: true, runValidators: true });
    return updatedPayment;
};

const deleteById = async (paymentId) => {
    const deletedPayment = await Payment.findByIdAndDelete(paymentId);
    return deletedPayment;
};


module.exports = {
    getAll,
    getById,
    getByUserId,
    getByOrderId,
    create,
    update,
    deleteById
};