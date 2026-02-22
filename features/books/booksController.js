const handleAsyncError = require("../../middlewares/handleAsyncError");
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
        // book: {
        //     id: targetBook.id,
        //     title: targetBook.title,
        //     author: targetBook.author
        // }
        book: targetBook
    });
});

const createBookController = handleAsyncError(async (req, res) => {
    const newBook = req.body;
    const createdBook = await bookService.createBook(newBook);
    res.status(201).json({
        success: true,
        // book: {
        //     id: createdBook.id,
        //     title: createdBook.title,
        //     author: createdBook.author
        // }
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