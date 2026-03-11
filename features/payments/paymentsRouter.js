const requireAuth = require("../../middlewares/authMiddleware");
const requireRole = require("../../middlewares/roleMiddleware");
const { getAllPaymentsController, getPaymentController, getMyPaymentsController, createCheckoutSessionController, deletePaymentController } = require("./paymentsController");


const express = require("express");

const router = express.Router();


router.use(requireAuth);    // Should be logged in already to check user role


// User endpoints
router.get("/me", requireRole("user", "admin"), getMyPaymentsController);

router.get("/:id", requireRole("user", "admin"), getPaymentController);

router.post("/checkout-session/:orderId", requireRole("user", "admin"), createCheckoutSessionController);

// Admin endpoints
router.get("/", requireRole('admin'), getAllPaymentsController);

// Deleted because stripe webhook is the only source of the truth
// router.patch("/:id/status", requireRole('admin'), updatePaymentStatusController);

router.delete("/:id", requireRole('admin'), deletePaymentController);


module.exports = router;