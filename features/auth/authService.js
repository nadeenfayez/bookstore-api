const bcrypt = require("bcryptjs");
const usersRepo = require("../users/usersRepository.mongo");
const { generateToken } = require("../../utils/jwtUtils");
const { bcryptSalt } = require("../../configs/envConfigs");
const AppError = require("../../utils/AppError");
const verifyGoogleToken = require("../../utils/googleVerify");
const { mapUser } = require("../users/usersService");


const signUp = async (newUser) => {
    const { name, email, password, avatar } = newUser;  // Whitelisting fields

    if (await usersRepo.getByEmail(email)) {
        throw new AppError("Email is already in use!", 409);
    }

    const hashedPassword = await bcrypt.hash(password, +bcryptSalt);

    const createdUser = await usersRepo.create({ name, email, password: hashedPassword, avatar });

    const tokenPayload = mapUser(createdUser);

    const authToken = generateToken(tokenPayload, createdUser.id);

    return {
        user: tokenPayload,
        token: authToken
    }
};

const login = async (credentials) => {
    const existingUser = await usersRepo.getByEmail(credentials.email);

    if (!existingUser) throw new AppError("Invalid email or password!", 401);

    if (!existingUser.password && existingUser.googleId) throw new AppError("This account uses Google login.", 400);  // If user doesn't set password yet after google-login

    const isMatch = await bcrypt.compare(credentials.password, existingUser.password);

    if (!isMatch) throw new AppError("Invalid email or password!", 401);

    const tokenPayload = mapUser(existingUser);

    const authToken = generateToken(tokenPayload, existingUser.id);

    return {
        user: tokenPayload,
        token: authToken
    }
};

const findOrCreateGoogleUser = async (idToken) => {
    const googleData = await verifyGoogleToken(idToken);

    if (!googleData.emailVerified) throw new AppError("Email is not verified!", 401);

    let existingUser = await usersRepo.getByGoogleOrEmail(googleData.googleId, googleData.email);   // Strong identity check (email is mutable but Google ID (sub) is not) => Identity correctness

    if (!existingUser) {
        existingUser = await usersRepo.create({
            googleId: googleData.googleId,
            name: googleData.name,
            email: googleData.email,
            avatar: googleData.picture
        });
    }

    if (!existingUser.googleId) existingUser = await usersRepo.update(existingUser.id, { googleId: googleData.googleId, avatar: googleData.picture });  // Account linking

    const tokenPayload = mapUser(existingUser);

    const authToken = generateToken(tokenPayload, existingUser.id);

    return {
        user: tokenPayload,
        token: authToken
    }
};


module.exports = {
    signUp,
    login,
    findOrCreateGoogleUser
};