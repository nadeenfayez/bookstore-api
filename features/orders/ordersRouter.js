const requireAuth = require("../../middlewares/authMiddleware");
const requireRole = require("../../middlewares/roleMiddleware");
const { getAllOrdersController, getOrderController, getMyOrdersController, createOrderController, deleteOrderController, updateOrderStatusController } = require("./ordersController");


const express = require("express");

const router = express.Router();


router.use(requireAuth);    // Should be logged in already to check user role


// User endpoints
router.get("/me", requireRole("user", "admin"), getMyOrdersController);

router.get("/:id", requireRole("user", "admin"), getOrderController);

router.post("/", requireRole("user", "admin"), createOrderController);

// Admin endpoints
router.get("/", requireRole('admin'), getAllOrdersController);

router.patch("/:id/status", requireRole('admin'), updateOrderStatusController);

router.delete("/:id", requireRole('admin'), deleteOrderController);


module.exports = router;