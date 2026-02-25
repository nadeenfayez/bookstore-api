const requireAuth = require("../../middlewares/authMiddleware");
const requireRole = require("../../middlewares/roleMiddleware");
const { getAllBooksController, getBookController, createBookController, deleteBookController, updateBookController } = require("./booksController");


const express = require("express");

const router = express.Router();

router.use(requireAuth);    // Should be logged in already to check user role

router.get("/", requireRole("admin", "user"), getAllBooksController);

router.get("/:id", requireRole("admin", "user"), getBookController);

// Admin endpoints
router.post("/", requireRole('admin'), createBookController);

router.delete("/:id", requireRole('admin'), deleteBookController);

router.patch("/:id", requireRole('admin'), updateBookController);


module.exports = router;