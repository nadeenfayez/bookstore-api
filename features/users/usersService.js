const { DBType, bcryptSalt } = require("../../configs/envConfigs");
const AppError = require("../../utils/AppError");
const bcrypt = require("bcryptjs");

const usersRepo = DBType === "mongo"
    ? require("./usersRepository.mongo")
    : require("./usersRepository.fs");


const mapUser = (dbUser) => ({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    avatar: dbUser.avatar
});


const getAllUsers = async () => {
    return (await usersRepo.getAll()).map(mapUser);
};


const getUser = async (userId) => {
    const existingUser = await usersRepo.getById(userId);

    if (!existingUser) throw new AppError("User is not found.", 404);

    return mapUser(existingUser);
};


const getProfile = async (userId) => {
    const existingUser = await usersRepo.getById(userId);

    if (!existingUser) throw new AppError("User is not found.", 404);

    return mapUser(existingUser);
};


const createUser = async (newUser) => {
    const { name, email, password, avatar } = newUser;  // Whitelisting fields

    if (await usersRepo.getByEmail(email)) throw new AppError("Email is already in use.", 409);

    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

    const createdUser = usersRepo.create({ name, email, password: hashedPassword, avatar });

    await usersRepo.bulkSave(createdUser);

    return mapUser(createdUser);
};


const updateProfile = async (userId, updates) => {
    const existingUser = await usersRepo.getById(userId);

    if (!existingUser) throw new AppError("User is not found.", 404);

    const { name, avatar } = updates;  // Whitelisting fields

    const updatedUser = await usersRepo.update(userId, { name, avatar });

    return mapUser(updatedUser);
};


const changePassword = async (userId, oldPassword, newPassword) => {
    const existingUser = await usersRepo.getById(userId);

    if (!existingUser) throw new AppError("User is not found.", 404);

    if (existingUser.googleId && !existingUser.password) {  // First-time password set (Google user)
        const hashedPassword = await bcrypt.hash(newPassword, bcryptSalt);

        const updatedUser = await usersRepo.update(userId, { password: hashedPassword });

        return mapUser(updatedUser);
    }

    if (!oldPassword) throw new AppError("Old password is required to change your password.", 400);

    const isMatch = await bcrypt.compare(oldPassword, existingUser.password);

    if (!isMatch) throw new AppError("Old password is incorrect.", 401);

    const isSame = await bcrypt.compare(newPassword, existingUser.password);    // Preventing same password reuse

    if (isSame) throw new AppError("New password must be different.", 400);

    const hashedPassword = await bcrypt.hash(newPassword, bcryptSalt);

    const updatedUser = await usersRepo.update(userId, { password: hashedPassword });

    await usersRepo.invalidateAllTokens(userId);    // Logout user from all devices

    return mapUser(updatedUser);
};


const changeRole = async (userId, newRole, adminId) => {
    const existingUser = await usersRepo.getById(userId);

    if (!existingUser) throw new AppError("User is not found.", 404);

    newRole = newRole.toLowerCase();
    const allowedRoles = ["admin", "user"];

    if (!allowedRoles.includes(newRole)) throw new AppError("Invalid role.", 400);

    if (userId == adminId) throw new AppError("Cannot change your own role.", 403)

    const updatedUser = await usersRepo.update(userId, { role: newRole });

    return mapUser(updatedUser);
};


const deleteUser = async (userId) => {
    const existingUser = await usersRepo.getById(userId);

    if (!existingUser) throw new AppError("User is not found.", 404);

    const deletedUser = await usersRepo.deleteById(userId);

    return mapUser(deletedUser);
};


module.exports = {
    getAllUsers,
    getUser,
    getProfile,
    createUser,
    updateProfile,
    changePassword,
    changeRole,
    deleteUser,
    mapUser
};