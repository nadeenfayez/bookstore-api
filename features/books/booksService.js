const { DBType } = require("../../configs/envConfigs");
const AppError = require("../../utils/AppError");

const booksRepo = DBType === "mongo"
    ? require("./booksRepository.mongo")
    : require("./booksRepository.fs");


const mapBook = (dbBook) => ({
    id: dbBook.id,
    title: dbBook.title,
    author: dbBook.author,
});


const getAllBooks = async () => {
    return (await booksRepo.getAll()).map(mapBook);
};

const getBook = async (bookId) => {
    const existingBook = await booksRepo.getById(bookId);

    if (!existingBook) throw new AppError("Book is not found!", 404);

    return mapBook(existingBook);
};

const createBook = async (newBook) => {
    if (!newBook?.title) throw new AppError("Book title is required!", 400);

    const createdBook = await booksRepo.create(newBook);

    return mapBook(createdBook);
};

const updateBook = async (bookId, updates) => { //Should I make the title mandatory here?
    const existingBook = await booksRepo.getById(bookId);

    if (!existingBook) throw new AppError("Book is not found!", 404);

    const updatedBook = await booksRepo.update(bookId, updates);

    return mapBook(updatedBook);
};

const deleteBook = async (bookId) => {
    const existingBook = await booksRepo.getById(bookId);

    if (!existingBook) throw new AppError("Book is not found!", 404);

    const deletedBook = await booksRepo.delete_(bookId);

    return mapBook(deletedBook);
};


module.exports = {
    getAllBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook
};