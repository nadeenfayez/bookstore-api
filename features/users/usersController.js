const handleAsyncError = require("../../middlewares/handleAsyncError");
const AppError = require("../../utils/AppError");
const userService = require("./usersService");


const getAllUsersController = handleAsyncError(async (req, res) => {
    const allUsers = await userService.getAllUsers();

    res.status(200).json({
        success: true,
        users: allUsers
    });
});

const getUserController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const targetUser = await userService.getUser(id);

    res.status(200).json({
        success: true,
        user: targetUser
    });
});

const createUserController = handleAsyncError(async (req, res) => {
    const newUser = req.body;

    if (!newUser?.name || !newUser?.email || !newUser?.password) throw new AppError("User name & email & password are required!", 400); // HTTP-level validation

    const createdUser = await userService.createUser(newUser);

    res.status(201).json({
        success: true,
        user: createdUser
    });
});

const deleteUserController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const deletedUser = await userService.deleteUser(id);

    res.status(200).json({
        success: true,
        user: deletedUser
    });
});

const updateProfileController = handleAsyncError(async (req, res) => {
    const { id } = req.currentUser; // Self-service endpoint

    if (!req.body.name && !req.body.avatar) throw new AppError("At least one field (name or avatar) is required!", 400); // HTTP-level validation

    const updatedUser = await userService.updateProfile(id, req.body);

    res.status(200).json({
        success: true,
        user: updatedUser
    });
});

const changePasswordController = handleAsyncError(async (req, res) => {
    const { id } = req.currentUser; // Self-service endpoint

    if (!req.body.newPassword) throw new AppError("newPassword is required!", 400);    // HTTP-level validation

    const updatedUser = await userService.changePassword(id, req.body.oldPassword, req.body.newPassword);

    res.status(200).json({
        success: true,
        user: updatedUser
    });
});

const changeRoleController = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const adminId = req.currentUser.id;

    if (!req.body.newRole) throw new AppError("newRole is required!", 400);    // HTTP-level validation

    const updatedUser = await userService.changeRole(id, req.body.newRole, adminId);

    res.status(200).json({
        success: true,
        user: updatedUser
    });
});


module.exports = {
    getAllUsersController,
    getUserController,
    createUserController,
    deleteUserController,
    updateProfileController,
    changePasswordController,
    changeRoleController
};