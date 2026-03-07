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
    const newBook = req.body ?? {};

    if (!newBook.title) throw new AppError("Title is required.", 400);  // HTTP-level validation
    if (!newBook.price) throw new AppError("Price is required.", 400);  // HTTP-level validation
    if (newBook.price.amount === undefined) throw new AppError("Price amount is required.", 400);   // HTTP-level validation
    if (newBook.stockQty === undefined) throw new AppError("Stock quantity is required.", 400); // HTTP-level validation

    const createdBook = await bookService.createBook(newBook);

    res.status(201).json({
        success: true,
        book: createdBook
    });
});


const updateBookController = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const { title, author, price, stockQty, isActive } = req.body ?? {};

    const hasAtLeastOneField =
        title !== undefined || author !== undefined ||
        price !== undefined || stockQty !== undefined ||
        isActive !== undefined;

    if (!hasAtLeastOneField) throw new AppError("At least one field (title, author, price, stock quantity or isActive) is required.", 400); // HTTP-level validation

    if (price !== undefined && price.amount === undefined) throw new AppError("Price amount is required when price is provided.", 400);  // HTTP-level validation

    const updatedBook = await bookService.updateBook(id, req.body);

    res.status(200).json({
        success: true,
        book: updatedBook
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


module.exports = {
    getAllBooksController,
    getBookController,
    createBookController,
    updateBookController,
    deleteBookController
};