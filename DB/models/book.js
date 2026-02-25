const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        unique: true,
        trim: true
    },
    author: {
        type: String,
        trim: true
    }
},
    {
        timestamps: true
    }
);

const Book = mongoose.model("Book", bookSchema);


module.exports = Book;