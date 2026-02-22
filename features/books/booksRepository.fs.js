const { booksFilePath } = require("../../configs/envConfigs");
const jsonFileUtils = require("../../utils/jsonFileUtils");

const getAll = () => {
    const allBooks = jsonFileUtils.readJson(booksFilePath);
    return allBooks;
};

const getById = (bookId) => {
    const allBooks = getAll();
    const targetBook = allBooks.find((book) => book.id == bookId);
    return targetBook;
};

const create = (newBook) => {
    const allBooks = getAll();

    const newId = allBooks.length ? allBooks[allBooks.length - 1].id + 1 : 1;

    const createdBook = { id: newId, ...newBook };
    allBooks.push(createdBook);

    jsonFileUtils.writeJson(booksFilePath, allBooks);
    return createdBook;
};

const update = (bookId, updates) => {
    let allBooks = getAll();

    let targetBookIndex = allBooks.findIndex((book) => book.id == bookId);

    const updatedBook = { id: +bookId, ...updates };
    allBooks[targetBookIndex] = updatedBook;

    jsonFileUtils.writeJson(booksFilePath, allBooks);
    return updatedBook;
};

const delete_ = (bookId) => {
    let allBooks = getAll();

    const deletedBook = allBooks.find((book) => book.id == bookId);

    const newBooks = allBooks.filter((book) => book.id != bookId);
    jsonFileUtils.writeJson(booksFilePath, newBooks);

    return deletedBook;
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete_
};