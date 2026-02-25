const Book = require("../../DB/models/book");


const getAll = async () => {
    const allBooks = await Book.find();
    return allBooks;
};

const getById = async (bookId) => {
    const targetBook = await Book.findById(bookId);
    return targetBook;
};

const getByTitle = async (bookTitle) => {
    const targetBook = await Book.findOne({ title: bookTitle });
    return targetBook;
};

const create = async (bookData) => {
    // const createdBook = await Book.create({ title, author });
    const newBook = new Book(bookData);
    return await newBook.save();
};

const update = async (bookId, updates) => {
    const updatedBook = await Book.findByIdAndUpdate(bookId, { $set: updates }, { new: true, runValidators: true });
    return updatedBook;
};

const delete_ = (bookId) => {
    const deletedBook = Book.findByIdAndDelete(bookId);
    return deletedBook;
};


module.exports = {
    getAll,
    getById,
    getByTitle,
    create,
    update,
    delete_
};