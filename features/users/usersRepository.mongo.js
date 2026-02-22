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

const create = async ({ googleId, name, email, password, avatar }) => { //Whitelisting fields //ask chatgpt should it be here or on the service and here be clean with just updates??
    // const createdUser = await User.create({ name, email, password });
    const newUser = new User({ googleId, name, email, password, avatar });
    return await newUser.save();
};

const update = async (userId, { googleId, name, email, password, avatar }) => { //Whitelisting fields
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: { googleId, name, email, password, avatar } }, { new: true, runValidators: true });
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