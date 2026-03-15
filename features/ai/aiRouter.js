// const requireAuth = require("../../middlewares/authMiddleware");
const { generateBookSummaryByBookIdController, recommendBooksByBookIdController } = require("./aiController");


const express = require("express");

const router = express.Router();


// Public routes
router.post("/books/:id/summary", generateBookSummaryByBookIdController);

router.post("/books/:id/recommendations", recommendBooksByBookIdController);


// // Authenticated routes
// router.delete("/sessions/current", requireAuth, logoutController);  // Self-service endpoint

// router.delete("/sessions", requireAuth, logoutAllController);  // Self-service endpoint


module.exports = router;