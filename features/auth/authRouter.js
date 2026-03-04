const requireAuth = require("../../middlewares/authMiddleware");
const { signUpController, loginController, googleLoginController, refreshController, logoutAllController } = require("./authController");


const express = require("express");

const router = express.Router();

// Public routes
router.post("/sign-up", signUpController);

router.post("/login", loginController);

router.post("/google-login", googleLoginController);

router.post("/refresh", refreshController);


// Authenticated routes
router.post("/logout-all", requireAuth, logoutAllController);  // Self-service endpoint


module.exports = router;