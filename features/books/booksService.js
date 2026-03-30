const { DBType } = require("../../configs/envConfigs");
const AppError = require("../../utils/AppError");

const booksRepo = DBType === "mongo"
    ? require("./booksRepository.mongo")
    : require("./booksRepository.fs");

const aiCacheRepo = DBType === "mongo"
    ? require("../ai/aiCacheRepository.mongo")
    : require("../ai/aiCacheRepository.fs");


const mapBook = (dbBook) => ({
    id: dbBook.id,
    title: dbBook.title,
    author: dbBook.author,
    description: dbBook.description
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
    const { title, author, description, price, stockQty, isActive } = newBook;  // Whitelisting fields

    const existingBook = await booksRepo.getByTitle(title);

    if (existingBook) throw new AppError("Book title already exists.", 409);

    const createdBook = await booksRepo.create({ title, author, description, price, stockQty, isActive });

    await aiCacheRepo.deleteAll();   // Invalidate recommendations cache because new candidate exists

    return mapBook(createdBook);
};


const updateBook = async (bookId, updates) => {
    const existingBook = await booksRepo.getById(bookId);

    if (!existingBook) throw new AppError("Book is not found.", 404);

    const { title, author, description, price, stockQty, isActive } = updates;  // Whitelisting fields

    if (title !== undefined && title !== existingBook.title) {
        if (await booksRepo.getByTitle(title)) throw new AppError("Book title already exists.", 409);
    }

    const updateData = { title, author, description, price, stockQty, isActive };


    const summaryRelevantChanged = (title !== undefined && title !== existingBook.title) ||
        (author !== undefined && author !== existingBook.author) || (description !== undefined && description !== existingBook.description);

    const recommendationsRelevantChanged = summaryRelevantChanged ||
        (price !== undefined && (price.amount !== existingBook.price.amount || price.currency !== existingBook.price.currency)) ||
        (isActive !== undefined && isActive !== existingBook.isActive);


    if (summaryRelevantChanged) {
        updateData.aiSummary = null;    // Invalidate summary cache
        updateData.aiEmbedding = null;  // Invalidate ai embedding
    };

    if (recommendationsRelevantChanged) await aiCacheRepo.deleteAll();   // Invalidate recommendations cache

    // await aiCacheRepo.deleteByBookId(bookId);   // Invalidate recommendations cache

    const updatedBook = await booksRepo.update(bookId, updateData);

    return mapBook(updatedBook);
};


const deleteBook = async (bookId) => {
    const existingBook = await booksRepo.getById(bookId);

    if (!existingBook) throw new AppError("Book is not found.", 404);

    const deletedBook = await booksRepo.deleteById(bookId);

    return mapBook(deletedBook);
};


module.exports = {
    getAllBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook
};