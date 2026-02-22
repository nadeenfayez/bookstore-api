const requireAuth = require("../../middlewares/authMiddleware");
const requireRole = require("../../middlewares/roleMiddleware");
const { getAllUsersController, getUserController, createUserController, deleteUserController, updateUserController } = require("./usersController");

const express = require("express");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("admin"));   //Should be signed in already to check his/her role

router.get("/", getAllUsersController);

router.get("/:id", getUserController);

router.post("/", createUserController);

router.delete("/:id", deleteUserController);

router.put("/:id", updateUserController);


module.exports = router;