const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true,
        required: false
    },
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ["user", "admin", "staff"],
        default: "user"
    },
    avatar: {
        type: String,
        required: false
    }
},
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);


module.exports = User;