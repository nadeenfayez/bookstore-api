const mongoose = require("mongoose");

const recommendedBooksSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    author: {
        type: String,
        trim: true
    },
    price: {
        amount: { type: Number, required: [true, "Price amount is required"], min: 0 },
        currency: { type: String, required: true, default: "EGP", uppercase: true }
    },
    reason: {
        type: String,
        required: true,
        trim: true
    }
},
    { _id: false }
);

const aiCacheSchema = new mongoose.Schema({
    sourceBookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        unique: true,
        required: true
    },
    recommendedBooks: [recommendedBooksSchema]
},
    {
        timestamps: true
    }
);

const AiCache = mongoose.model("AiCache", aiCacheSchema);


module.exports = AiCache;