const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true    // Prevent multiple payments for one order
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    provider: {
        type: String,
        enum: ["stripe"],
        required: true,
        default: "stripe"
    },
    status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    totalPrice: {
        amount: { type: Number, required: [true, "Total price amount is required"], min: 0 },
        currency: { type: String, required: true, default: "EGP", uppercase: true }
    },
    checkoutSessionId: {
        type: String
    },
    paymentIntentId: {
        type: String
    },
},
    {
        timestamps: true,
    }
);

const Payment = mongoose.model("Payment", paymentSchema);


module.exports = Payment;