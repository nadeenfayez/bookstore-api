const requireAuth = require("../../middlewares/authMiddleware");
const { generateBookSummaryByBookIdController, recommendBooksByBookIdController, chatWithBookstoreController, generateBookEmbeddingController, generateEmbeddingsForAllBooksController } = require("./aiController");
const { aiSummaryLimiter, aiRecommendationsLimiter, aiChatLimiter } = require("../../middlewares/aiRateLimiter");


const express = require("express");
const requireRole = require("../../middlewares/roleMiddleware");

const router = express.Router();


// Public routes
router.post("/books/:id/summary", aiSummaryLimiter, generateBookSummaryByBookIdController);

router.post("/books/:id/recommendations", aiRecommendationsLimiter, recommendBooksByBookIdController);

router.post("/chat", requireAuth, aiChatLimiter, chatWithBookstoreController);

router.post("/books/:id/embedding", requireAuth, requireRole("admin"), generateBookEmbeddingController);

router.post("/books/embeddings/rebuild", requireAuth, requireRole("admin"), generateEmbeddingsForAllBooksController);

// // Authenticated routes
// router.delete("/sessions/current", requireAuth, logoutController);  // Self-service endpoint

// router.delete("/sessions", requireAuth, logoutAllController);  // Self-service endpoint


module.exports = router;