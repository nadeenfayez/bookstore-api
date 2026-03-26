const mongoose = require("mongoose");
const { mongoURI } = require("../configs/envConfigs");


// Connection events (for monitoring & debugging)
mongoose.connection.on("connecting", () => console.log("MongoDB connecting..."));
mongoose.connection.on("connected", () => console.log("MongoDB connected successfully."));
mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));
mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected."));

// Connection function
const connectDB = async () => {
    await mongoose.connect(mongoURI);
};


module.exports = connectDB;