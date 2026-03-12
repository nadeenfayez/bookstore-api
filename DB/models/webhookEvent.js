const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        enum: ["stripe"],
        required: true,
        default: "stripe"
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: false
    },
    processed: {
        type: Boolean,
        default: false
    },
    processedAt: {
        type: Date
    }
},
    {
        timestamps: true,
    }
);

const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);


module.exports = WebhookEvent;