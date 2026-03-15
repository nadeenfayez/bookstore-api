// const requireAuth = require("../../middlewares/authMiddleware");
const { generateBookSummaryByBookIdController } = require("./aiController");


const express = require("express");

const router = express.Router();


// Public routes
router.post("/books/:id/summary", generateBookSummaryByBookIdController);

// // Authenticated routes
// router.delete("/sessions/current", requireAuth, logoutController);  // Self-service endpoint

// router.delete("/sessions", requireAuth, logoutAllController);  // Self-service endpoint


module.exports = router;