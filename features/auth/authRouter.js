const { signUpController, loginController, googleLoginController } = require("./authController");
const express = require("express");

const router = express.Router();

router.post("/sign-up", signUpController);

router.post("/login", loginController);

router.post("/google-login", googleLoginController);


module.exports = router;