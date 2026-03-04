const User = require("../../DB/models/user");


const getAll = async () => {
    const allUsers = await User.find();
    return allUsers;
};

const getById = async (userId) => {
    const targetUser = await User.findById(userId);
    return targetUser;
};

const getByEmail = async (userEmail) => {
    const targetUser = await User.findOne({ email: userEmail });
    return targetUser;
};

const getByGoogleOrEmail = async (userGoogleId, userEmail) => {
    const targetUser = await User.findOne({
        $or: [
            { googleId: userGoogleId },
            { email: userEmail }
        ]
    });
    return targetUser;
};

const getByRefreshToken = async (refreshToken) => {
    const targetUser = await User.findOne({ "refreshTokens.tokenHash": refreshToken });
    return targetUser;
};

const create = (userData) => {
    // const createdUser = await User.create(userData);
    return new User(userData);
    // return await newUser.save();
};

const bulkSave = async (userDoc) => {
    return await userDoc.save();
};

const invalidateAllTokens = async (userId) => {
    return await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } }, { new: true, runValidators: true });;
};

const update = async (userId, updates) => {
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
    return updatedUser;
};

const delete_ = async (userId) => {
    const deletedUser = User.findByIdAndDelete(userId);
    return deletedUser;
};


module.exports = {
    getAll,
    getById,
    getByEmail,
    getByGoogleOrEmail,
    getByRefreshToken,
    create,
    bulkSave,
    invalidateAllTokens,
    update,
    delete_
};