const requireAuth = require("../../middlewares/authMiddleware");
const { signUpController, loginController, googleLoginController, refreshController, logoutController, logoutAllController } = require("./authController");


const express = require("express");

const router = express.Router();


// Public routes
router.post("/signup", signUpController);

router.post("/login", loginController);

router.post("/google-login", googleLoginController);

router.post("/refresh", refreshController);

// Authenticated routes
router.delete("/sessions/current", requireAuth, logoutController);  // Self-service endpoint

router.delete("/sessions", requireAuth, logoutAllController);  // Self-service endpoint


module.exports = router;