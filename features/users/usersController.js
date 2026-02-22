const handleAsyncError = require("../../middlewares/handleAsyncError");
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
        // user: {
        //     id: targetUser.id,
        //     name: targetUser.name,
        //     email: targetUser.email,
        //     role: targetUser.role
        // }
        user: targetUser
    });
});

const createUserController = handleAsyncError(async (req, res) => {
    const newUser = req.body;
    const createdUser = await userService.createUser(newUser);
    res.status(201).json({
        success: true,
        // user: {
        //     id: createdUser.id,
        //     name: createdUser.name,
        //     email: createdUser.email,
        //     role: createdUser.role
        // }
        user: createdUser
    });
});

const deleteUserController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const deletedUser = await userService.deleteUser(id);
    res.status(200).json({
        success: true,
        // user: {
        //     id: deletedUser.id,
        //     name: deletedUser.name,
        //     email: deletedUser.email,
        //     role: deletedUser.role
        // }
        user: deletedUser
    });
});

const updateUserController = handleAsyncError(async (req, res) => {
    const { id } = req.params;

    const updatedUser = await userService.updateUser(id, req.body);
    res.status(200).json({
        success: true,
        // user: {
        //     id: updatedUser.id,
        //     name: updatedUser.name,
        //     email: updatedUser.email,
        //     role: updatedUser.role
        // }
        user: updatedUser
    });
});


module.exports = {
    getAllUsersController,
    getUserController,
    createUserController,
    deleteUserController,
    updateUserController
};