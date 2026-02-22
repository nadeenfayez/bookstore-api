const mongoose = require("mongoose");
const { mongoURI } = require("../configs/envConfigs");

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully");
    }
    catch (err) {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1); // stop app if DB fails
    }
};

module.exports = connectDB;