const Book = require("../../DB/models/book");


const getAll = async () => {
    const allBooks = await Book.find();
    return allBooks;
};

const getById = async (bookId, session = null) => {
    const targetBook = await Book.findById(bookId).session(session);
    return targetBook;
};

const getAllActive = async () => {
    const targetBooks = await Book.find({ isActive: true });
    return targetBooks;
};

const getActiveByIds = async (bookIds) => {
    const targetBooks = await Book.find({ _id: { $in: bookIds }, isActive: true });
    return targetBooks;
};

const getActiveExcludingId = async (bookId) => {
    const targetBooks = await Book.find({ _id: { $ne: bookId }, isActive: true });
    return targetBooks;
};

const searchActiveByText = async (keywords) => {
    if (keywords.length === 0) return [];

    const conditions = keywords.map(keyword => ({
        $or: [
            { title: { $regex: keyword, $options: "i" } },
            { author: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } }
        ]
    }));

    return await Book.find({ isActive: true, $or: conditions });
};

const getByTitle = async (bookTitle) => {
    const targetBook = await Book.findOne({ title: bookTitle });
    return targetBook;
};

const create = async (bookData) => {
    const newBook = new Book(bookData);
    return await newBook.save();
};

const update = async (bookId, updates) => {
    const updatedBook = await Book.findByIdAndUpdate(bookId, { $set: updates }, { new: true, runValidators: true });
    return updatedBook;
};

const deleteById = async (bookId) => {
    const deletedBook = await Book.findByIdAndDelete(bookId);
    return deletedBook;
};

const bulkUpdateStock = async (updates, session = null) => {
    return await Book.bulkWrite(
        updates.map(item => ({
            updateOne: {
                filter: { _id: item.bookId },
                update: { $set: { stockQty: item.newStockQty } }
            }
        })),
        { session }
    );
};


module.exports = {
    getAll,
    getById,
    getAllActive,
    getActiveByIds,
    getActiveExcludingId,
    searchActiveByText,
    getByTitle,
    create,
    update,
    deleteById,
    bulkUpdateStock
};