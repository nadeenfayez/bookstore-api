const { usersFilePath } = require("../../configs/envConfigs");
const jsonFileUtils = require("../../utils/jsonFileUtils");

const getAll = async () => {
    const allUsers = await jsonFileUtils.readJson(usersFilePath);
    return allUsers;
};

const getById = async (userId) => {
    const allUsers = await getAll();
    const targetUser = allUsers.find((user) => user.id == userId);
    return targetUser;
};

const getByEmail = async (userEmail) => {
    const allUsers = await getAll();
    const targetUser = allUsers.find((user) => user.email === userEmail);
    return targetUser;
};

const create = async (newUser) => {
    const allUsers = await getAll();

    const newId = allUsers.length ? allUsers[allUsers.length - 1].id + 1 : 1;

    const createdUser = { id: newId, ...newUser, role: "user" };
    allUsers.push(createdUser);

    await jsonFileUtils.writeJson(usersFilePath, allUsers);
    return createdUser;
};

const update = async (userId, updates) => {
    let allUsers = await getAll();

    let targetUserIndex = allUsers.findIndex((user) => user.id == userId);

    const updatedUser = { id: +userId, ...updates };
    allUsers[targetUserIndex] = updatedUser;

    await jsonFileUtils.writeJson(usersFilePath, allUsers);
    return updatedUser;
};

const delete_ = async (userId) => {
    let allUsers = await getAll();

    const deletedUser = allUsers.find((user) => user.id == userId);

    const newUsers = allUsers.filter((user) => user.id != userId);
    await jsonFileUtils.writeJson(usersFilePath, newUsers);

    return deletedUser;
};


module.exports = {
    getAll,
    getById,
    getByEmail,
    create,
    update,
    delete_
};