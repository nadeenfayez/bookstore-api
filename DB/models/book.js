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
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        amount: { type: Number, required: [true, "Price amount is required"], min: 0 },
        currency: { type: String, required: true, default: "EGP", uppercase: true }
    },
    stockQty: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    }
);

const Book = mongoose.model("Book", bookSchema);


module.exports = Book;