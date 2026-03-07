const express = require("express");
const cors = require("cors");
const booksRouter = require("./features/books/booksRouter");
const usersRouter = require("./features/users/usersRouter");
const ordersRouter = require("./features/orders/ordersRouter");
const paymentsRouter = require("./features/orders/paymentsRouter");
const authRouter = require("./features/auth/authRouter");
const loggerMiddleware = require("./middlewares/loggerMiddleware");
const { PORT } = require("./configs/envConfigs");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const notFoundHandler = require("./middlewares/notFoundHandler");
const connectDB = require("./DB/connection");
const cookieParser = require("cookie-parser");


const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

connectDB();

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/books", booksRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/payments", paymentsRouter);

app.use(notFoundHandler);

app.use(globalErrorHandler);


app.listen(PORT, (err) => {
    if (err) return console.log("Failed to connect to the server!");
    console.log(`Express server listening on port ${PORT}`);
});