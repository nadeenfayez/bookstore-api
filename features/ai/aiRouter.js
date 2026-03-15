// const requireAuth = require("../../middlewares/authMiddleware");
const { generateBookSummaryController } = require("./aiController");


const express = require("express");

const router = express.Router();


// Public routes
router.post("/book-summary", generateBookSummaryController);

// // Authenticated routes
// router.delete("/sessions/current", requireAuth, logoutController);  // Self-service endpoint

// router.delete("/sessions", requireAuth, logoutAllController);  // Self-service endpoint


module.exports = router;