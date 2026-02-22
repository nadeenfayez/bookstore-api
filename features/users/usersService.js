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
    role: dbUser.role
});


const getAllUsers = async () => {
    return (await usersRepo.getAll()).map(mapUser);
};

const getUser = async (userId) => {
    const existingUser = await usersRepo.getById(userId);

    if (!existingUser) throw new AppError("User is not found!", 404);

    return mapUser(existingUser);
};

const createUser = async (newUser) => {
    if (!newUser?.name || !newUser?.email || !newUser?.password) throw new AppError("User name & email & password are required!", 400);

    if (await usersRepo.getByEmail(newUser.email)) throw new AppError("Email is already in use!", 409);

    const hashedPassword = bcrypt.hashSync(newUser.password, +bcryptSalt);

    const createdUser = await usersRepo.create({ ...newUser, password: hashedPassword });

    return mapUser(createdUser);
};

const updateUser = async (userId, updates) => {
    const existingUser = await usersRepo.getById(userId);

    if (!existingUser) throw new AppError("User is not found!", 404);

    if (updates.password) {
        const hashedPassword = bcrypt.hashSync(updates.password, +bcryptSalt);
        return await usersRepo.update(userId, { ...updates, password: hashedPassword });
    }

    const updatedUser = await usersRepo.update(userId, updates);

    return mapUser(updatedUser);
};

const deleteUser = async (userId) => {
    const existingUser = await usersRepo.getById(userId);

    if (!existingUser) throw new AppError("User is not found!", 404);

    const deletedUser = await usersRepo.delete_(userId);

    return mapUser(deletedUser);
};


module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};