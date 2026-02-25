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

const create = async (userData) => {
    // const createdUser = await User.create({ name, email, password });
    const newUser = new User(userData);
    return await newUser.save();
};

const update = async (userId, updates) => {
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
    return updatedUser;
};

const delete_ = (userId) => {
    const deletedUser = User.findByIdAndDelete(userId);
    return deletedUser;
};


module.exports = {
    getAll,
    getById,
    getByEmail,
    getByGoogleOrEmail,
    create,
    update,
    delete_
};