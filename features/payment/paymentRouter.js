const requireAuth = require("../../middlewares/authMiddleware");
const requireRole = require("../../middlewares/roleMiddleware");
const { getAllPaymentsController, getPaymentController, getMyPaymentsController, createPaymentController, deletePaymentController, updatePaymentStatusController } = require("./paymentController");


const express = require("express");

const router = express.Router();

router.use(requireAuth);    // Should be logged in already to check user role

// User endpoints
router.get("/me", requireRole("user", "admin"), getMyPaymentsController);

router.get("/:id", requireRole("user", "admin"), getPaymentController);

// Admin endpoints
router.get("/", requireRole('admin'), getAllPaymentsController);

router.post("/checkout-session/:orderId", requireRole("user", "admin"), createCheckOutSessionController);

router.patch("/:id", requireRole('admin'), updatePaymentStatusController);

router.delete("/:id", requireRole('admin'), deletePaymentController);


module.exports = router;