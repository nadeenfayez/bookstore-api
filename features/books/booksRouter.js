const requireAuth = require("../../middlewares/authMiddleware");
const requireRole = require("../../middlewares/roleMiddleware");
const { getAllBooksController, getBookController, createBookController, deleteBookController, updateBookController } = require("./booksController");

const express = require("express");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('admin'));   //Should be signed in already to check his/her role

router.get("/", getAllBooksController);

router.get("/:id", getBookController);

router.post("/", createBookController);

router.delete("/:id", deleteBookController);

router.put("/:id", updateBookController);


module.exports = router;