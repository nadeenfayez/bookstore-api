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

    if (!existingBook) throw new AppError("Book is not found.", 404);

    return mapBook(existingBook);
};

const createBook = async (newBook) => {
    const { title, author } = newBook;  // Whitelisting fields

    const existingBook = await booksRepo.getByTitle(title);

    if (existingBook) throw new AppError("Book title already exists.", 409);

    const createdBook = await booksRepo.create({ title, author });

    return mapBook(createdBook);
};

const updateBook = async (bookId, updates) => {
    const existingBook = await booksRepo.getById(bookId);

    if (!existingBook) throw new AppError("Book is not found.", 404);

    const { title, author } = updates;  // Whitelisting fields

    if (title) {
        if (await booksRepo.getByTitle(title)) throw new AppError("Book title already exists.", 409);
    }

    const updatedBook = await booksRepo.update(bookId, { title, author });

    return mapBook(updatedBook);
};

const deleteBook = async (bookId) => {
    const existingBook = await booksRepo.getById(bookId);

    if (!existingBook) throw new AppError("Book is not found.", 404);

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