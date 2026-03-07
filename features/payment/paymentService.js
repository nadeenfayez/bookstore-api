const { DBType } = require("../../configs/envConfigs");
const AppError = require("../../utils/AppError");

const paymentRepo = DBType === "mongo"
    ? require("./paymentRepository.mongo")
    : require("./paymentRepository.fs");

const booksRepo = DBType === "mongo"
    ? require("../books/booksRepository.mongo")
    : require("../books/booksRepository.fs");


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


const createPayment = async () => {

};


const updatePayment = async (paymentId) => {

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
    createPayment,
    updatePayment,
    deletePayment
};