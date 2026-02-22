const bcrypt = require("bcryptjs");
const usersRepo = require("../users/usersRepository.mongo");
const { generateToken } = require("../../utils/jwtUtils");
const { bcryptSalt } = require("../../configs/envConfigs");
const AppError = require("../../utils/AppError");
const verifyGoogleToken = require("../../utils/googleVerify");


const mapUser = (dbUser) => ({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    avatar: dbUser.avatar
});


const signUp = async (newUser) => {
    if (!newUser?.name || !newUser?.email || !newUser?.password) {
        throw new AppError("Name & email & password are required!", 400);
    }

    if (await usersRepo.getByEmail(newUser.email)) {
        throw new AppError("Email is already in use!", 409);
    }

    const hashedPassword = await bcrypt.hash(newUser.password, +bcryptSalt);

    const createdUser = await usersRepo.create({
        name: newUser.name,
        email: newUser.email,
        password: hashedPassword
    });

    // const tokenPayload = {
    //     id: createdUser.id,
    //     name: createdUser.name,
    //     email: createdUser.email,
    //     role: createdUser.role
    // };

    const tokenPayload = mapUser(createdUser);

    const authToken = generateToken(tokenPayload, createdUser.id);

    return {
        // user: {
        //     id: createdUser.id,
        //     name: createdUser.name,
        //     email: createdUser.email,
        //     role: createdUser.role
        // },
        user: tokenPayload,
        token: authToken
    }
};

const login = async (credentials) => {
    if (!credentials?.email || !credentials?.password) {
        throw new AppError("Email & password are required!", 400);
    }

    const existingUser = await usersRepo.getByEmail(credentials.email);

    if (!existingUser) throw new AppError("Invalid email or password!", 400);

    if (!existingUser.password && existingUser.googleId) throw new AppError("This account uses Google login.", 400);  //If user doesn't set password yet

    const isMatch = await bcrypt.compare(credentials.password, existingUser.password);

    if (!isMatch) throw new AppError("Invalid email or password!", 400);

    // const tokenPayload = {
    //     id: existingUser.id,
    //     name: existingUser.name,
    //     email: existingUser.email,
    //     role: existingUser.role
    // };

    const tokenPayload = mapUser(existingUser);

    const authToken = generateToken(tokenPayload, existingUser.id);

    return {
        // user: {
        //     id: existingUser.id,
        //     name: existingUser.name,
        //     email: existingUser.email,
        //     role: existingUser.role
        // },
        user: tokenPayload,
        token: authToken
    }
};

const findOrCreateGoogleUser = async (idToken) => {
    if (!idToken) throw new AppError("idToken is required!", 400);

    const googleData = await verifyGoogleToken(idToken);

    if (!googleData.emailVerified) throw new AppError("Email is not verified!", 400);

    let existingUser = await usersRepo.getByGoogleOrEmail(googleData.googleId, googleData.email);   //Strong identity check (email is mutable but Google ID (sub) is not) => Identity correctness

    if (!existingUser) {
        existingUser = await usersRepo.create({
            googleId: googleData.googleId,
            name: googleData.name,
            email: googleData.email,
            avatar: googleData.picture
        });
    }

    if (!existingUser.googleId) existingUser = await usersRepo.update(existingUser.id, { googleId: googleData.googleId, avatar: googleData.picture });  //Account linking

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