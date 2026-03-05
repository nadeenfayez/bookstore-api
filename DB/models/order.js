const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    title: String,  // Snapshot
    price: {    // Snapshot
        amount: { type: Number, required: [true, "Price amount is required"], min: 0 },
        currency: { type: String, required: true, default: "EGP", uppercase: true }
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    }
},
    {
        _id: false
    }
);


const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: {
        type: [orderItemSchema],
        valaidate: [arr => arr.length > 0, "Order must contain at least one item"]
    },
    totalPrice: {
        amount: { type: Number, required: [true, "Price amount is required"], min: 0 },
        currency: { type: String, required: true, default: "EGP", uppercase: true }
    },
    status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    }
},
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);


module.exports = Order;