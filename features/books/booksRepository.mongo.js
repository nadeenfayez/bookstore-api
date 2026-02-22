const Book = require("../../DB/models/book");

const getAll = async () => {
    const allBooks = await Book.find();
    return allBooks;
};

const getById = async (bookId) => {
    const targetBook = await Book.findById(bookId);
    return targetBook;
};

const create = async ({ title, author }) => {
    // const createdBook = await Book.create({ title, author });
    const newBook = new Book({ title, author });
    return await newBook.save();
};

const update = async (bookId, { title, author }) => {
    const updatedBook = await Book.findByIdAndUpdate(bookId, { $set: { title, author } }, { new: true, runValidators: true });
    return updatedBook;
};

const delete_ = (bookId) => {
    const deletedBook = Book.findByIdAndDelete(bookId);
    return deletedBook;
};


module.exports = {
    getAll,
    getById,
    create,
    update,
    delete_
};