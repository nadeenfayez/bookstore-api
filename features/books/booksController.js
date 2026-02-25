const handleAsyncError = require("../../middlewares/handleAsyncError");
const AppError = require("../../utils/AppError");
const bookService = require("./booksService");


const getAllBooksController = handleAsyncError(async (req, res) => {
    const allBooks = await bookService.getAllBooks();

    res.status(200).json({
        success: true,
        books: allBooks
    });
});

const getBookController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const targetBook = await bookService.getBook(id);

    res.status(200).json({
        success: true,
        book: targetBook
    });
});

const createBookController = handleAsyncError(async (req, res) => {
    const newBook = req.body;

    if (!newBook.title) throw new AppError("Book title is required!", 400);    // HTTP-level validation

    const createdBook = await bookService.createBook(newBook);

    res.status(201).json({
        success: true,
        book: createdBook
    });
});

const deleteBookController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const deletedBook = await bookService.deleteBook(id);

    res.status(200).json({
        success: true,
        book: deletedBook
    });
});

const updateBookController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!req.body.title && !req.body.author) throw new AppError("At least one field (title or author) is required!", 400); // HTTP-level validation

    const updatedBook = await bookService.updateBook(id, req.body);

    res.status(200).json({
        success: true,
        book: updatedBook
    });
});


module.exports = {
    getAllBooksController,
    getBookController,
    createBookController,
    deleteBookController,
    updateBookController
};