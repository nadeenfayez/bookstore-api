const express = require("express");
const cors = require("cors");
const booksRouter = require("./features/books/booksRouter");
const usersRouter = require("./features/users/usersRouter");
const ordersRouter = require("./features/orders/ordersRouter");
const paymentsRouter = require("./features/payments/paymentsRouter");
const aiRouter = require("./features/ai/aiRouter");
const authRouter = require("./features/auth/authRouter");
const loggerMiddleware = require("./middlewares/loggerMiddleware");
const { port } = require("./configs/envConfigs");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const notFoundHandler = require("./middlewares/notFoundHandler");
const connectDB = require("./DB/connection");
const cookieParser = require("cookie-parser");
const { handleStripeWebhookController } = require("./features/payments/paymentsController");
const redisClient = require("./configs/redis");


const app = express();

app.use(cors());
app.use(loggerMiddleware);


app.post("/webhooks/stripe", express.raw({ type: "application/json" }), handleStripeWebhookController);


app.use(express.json());
app.use(cookieParser());


connectDB();

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/books", booksRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/ai", aiRouter);


// Payment redirects (temporary for testing)
app.get("/payment-success", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Payment success redirect reached.",
        sessionId: req.query.session_id
    });
});

app.get("/payment-cancel", (req, res) => {
    res.status(200).json({
        success: false,
        message: "Payment canceled. You can try again."
    });
});


app.use(notFoundHandler);

app.use(globalErrorHandler);

const startServer = async () => {
    try {
        await redisClient.connect();

        app.listen(port, () => console.log(`Express server listening on port ${port}`));
    } catch (err) {
        console.error("Failed to connect to the server:", err);
        process.exit(1);
    }
};

startServer();

// app.listen(port, (err) => {
//     if (err) return console.error("Failed to connect to the server!");
//     console.log(`Express server listening on port ${port}`);
// });