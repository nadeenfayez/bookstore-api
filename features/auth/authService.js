const bcrypt = require("bcryptjs");
const usersRepo = require("../users/usersRepository.mongo");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../utils/jwtUtils");
const { bcryptSalt } = require("../../configs/envConfigs");
const AppError = require("../../utils/AppError");
const verifyGoogleToken = require("../../utils/googleVerify");
const { mapUser } = require("../users/usersService");
const { hashRefreshToken, addRefreshToken } = require("../../utils/refreshTokenUtils");


const signUp = async (newUser, req) => {
    const { name, email, password, avatar } = newUser;  // Whitelisting fields

    if (await usersRepo.getByEmail(email)) throw new AppError("Email is already in use!", 409);

    const hashedPassword = await bcrypt.hash(password, bcryptSalt);

    const createdUser = usersRepo.create({ name, email, password: hashedPassword, avatar });

    const tokenPayload = mapUser(createdUser);

    const accessToken = generateAccessToken(tokenPayload, createdUser.id);

    const refreshToken = generateRefreshToken(tokenPayload, createdUser.id);

    const refreshTokenHash = hashRefreshToken(refreshToken);

    addRefreshToken(createdUser, refreshTokenHash, req);

    await usersRepo.bulkSave(createdUser);

    return {
        user: tokenPayload,
        accessToken,
        refreshToken
    }
};

const login = async (credentials, req) => {
    const existingUser = await usersRepo.getByEmail(credentials.email);

    if (!existingUser) throw new AppError("Invalid email or password!", 401);

    if (!existingUser.password && existingUser.googleId) throw new AppError("This account uses Google login.", 400);  // If user doesn't set password yet after google-login

    const isMatch = await bcrypt.compare(credentials.password, existingUser.password);

    if (!isMatch) throw new AppError("Invalid email or password!", 401);

    const tokenPayload = mapUser(existingUser);

    const accessToken = generateAccessToken(tokenPayload, existingUser.id);

    const refreshToken = generateRefreshToken(tokenPayload, existingUser.id);

    const refreshTokenHash = hashRefreshToken(refreshToken);

    addRefreshToken(existingUser, refreshTokenHash, req);

    await usersRepo.bulkSave(existingUser);

    return {
        user: tokenPayload,
        accessToken,
        refreshToken
    }
};

const refreshAccessToken = async (refreshToken, req) => {   // Rotate a valid session
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const tokenDoc = await usersRepo.getByRefreshToken(refreshTokenHash);   //DB is the source of truth (check it first)

    const decoded = verifyRefreshToken(refreshToken);

    if (!tokenDoc) {    // Reuse detection
        await usersRepo.invalidateAllTokens(decoded.id);
        throw new AppError("Refresh token reuse detected!", 403);
    }

    tokenDoc.refreshTokens = tokenDoc.refreshTokens.filter(rt => rt.tokenHash !== refreshTokenHash);    // Remove old token (rotation)

    const tokenPayload = mapUser(tokenDoc);

    const newAccessToken = generateAccessToken(tokenPayload, tokenDoc.id);

    const newRefreshToken = generateRefreshToken(tokenPayload, tokenDoc.id);    // Rotation

    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    addRefreshToken(tokenDoc, newRefreshTokenHash, req);

    await usersRepo.bulkSave(tokenDoc);

    return {
        newAccessToken,
        newRefreshToken
    }
};

const findOrCreateGoogleUser = async (idToken, req) => {
    const googleData = await verifyGoogleToken(idToken);

    if (!googleData.emailVerified) throw new AppError("Email is not verified!", 401);

    let existingUser = await usersRepo.getByGoogleOrEmail(googleData.googleId, googleData.email);   // Strong identity check (email is mutable but Google ID (sub) is not) => Identity correctness

    if (!existingUser) {
        existingUser = usersRepo.create({
            googleId: googleData.googleId,
            name: googleData.name,
            email: googleData.email,
            avatar: googleData.picture
        });
    }

    if (!existingUser.googleId) {   // Account linking
        existingUser.googleId = googleData.googleId;
        existingUser.avatar = googleData.picture;
    }

    const tokenPayload = mapUser(existingUser);

    const accessToken = generateAccessToken(tokenPayload, existingUser.id);

    const refreshToken = generateRefreshToken(tokenPayload, existingUser.id);

    const refreshTokenHash = hashRefreshToken(refreshToken);

    addRefreshToken(existingUser, refreshTokenHash, req);

    await usersRepo.bulkSave(existingUser);

    return {
        user: tokenPayload,
        accessToken,
        refreshToken
    }
};

const logout = async (refreshToken) => {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const tokenDoc = await usersRepo.getByRefreshToken(refreshTokenHash);

    if (!tokenDoc) return;

    tokenDoc.refreshTokens = tokenDoc.refreshTokens.filter(rt => rt.tokenHash !== refreshTokenHash);    // Logout from this device only

    await usersRepo.bulkSave(tokenDoc);
};

const logoutAll = async (userId) => {
    await usersRepo.invalidateAllTokens(userId);
};


module.exports = {
    signUp,
    login,
    refreshAccessToken,
    findOrCreateGoogleUser,
    logout,
    logoutAll
};