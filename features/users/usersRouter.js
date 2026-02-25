const requireAuth = require("../../middlewares/authMiddleware");
const requireRole = require("../../middlewares/roleMiddleware");
const { getAllUsersController, getUserController, createUserController, deleteUserController, updateProfileController, changePasswordController, changeRoleController } = require("./usersController");


const express = require("express");

const router = express.Router();

router.use(requireAuth);    // Should be logged in already to check user role

// Admin endpoints
router.get("/", requireRole("admin"), getAllUsersController);

router.get("/:id", requireRole("admin"), getUserController);

router.post("/", requireRole("admin"), createUserController);

router.delete("/:id", requireRole("admin"), deleteUserController);

router.patch("/:id/role", requireRole("admin"), changeRoleController);

// Self-service endpoints
router.patch("/me", requireRole("admin", "user"), updateProfileController);

router.patch("/me/password", requireRole("admin", "user"), changePasswordController);


module.exports = router;