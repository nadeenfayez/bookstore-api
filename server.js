const { port } = require("./configs/envConfigs");
const connectDB = require("./DB/connection");
const { connectRedis } = require("./configs/redis");


const startServer = async () => {
    try {
        await connectRedis();

        await connectDB();

        const app = require("./app");

        app.listen(port, () => console.log(`Express server listening on port ${port}.`));
    }
    catch (err) {
        console.error("Failed to connect to the server:", err);
        process.exit(1);
    }
};

startServer();