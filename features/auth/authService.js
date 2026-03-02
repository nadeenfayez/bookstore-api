const bcrypt = require("bcryptjs");
const usersRepo = require("../users/usersRepository.mongo");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../utils/jwtUtils");
const { bcryptSalt, unixRefreshExpiry } = require("../../configs/envConfigs");
const AppError = require("../../utils/AppError");
const verifyGoogleToken = require("../../utils/googleVerify");
const { mapUser } = require("../users/usersService");
const { hashRefreshToken } = require("../../utils/refreshTokenUtils");


const signUp = async (newUser, req) => {
    const { name, email, password, avatar } = newUser;  // Whitelisting fields

    if (await usersRepo.getByEmail(email)) {
        throw new AppError("Email is already in use!", 409);
    }

    const hashedPassword = await bcrypt.hash(password, +bcryptSalt);

    const createdUser = await usersRepo.create({ name, email, password: hashedPassword, avatar });

    const tokenPayload = mapUser(createdUser);

    const accessToken = generateAccessToken(tokenPayload, createdUser.id);

    const refreshToken = generateRefreshToken(tokenPayload, createdUser.id);

    const RefreshTokenHash = hashRefreshToken(refreshToken);

    // await usersRepo.update(createdUser.id, { refreshToken: RefreshTokenHash });

    createdUser.refreshTokens.push({
        tokenHash: RefreshTokenHash,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + +unixRefreshExpiry),
        ip: req.ip
    });

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

    const RefreshTokenHash = hashRefreshToken(refreshToken);

    // await usersRepo.update(existingUser.id, { refreshToken: RefreshTokenHash });

    existingUser.refreshTokens.push({
        tokenHash: RefreshTokenHash,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + +unixRefreshExpiry),
        ip: req.ip
    });

    await usersRepo.bulkSave(existingUser);

    return {
        user: tokenPayload,
        accessToken,
        refreshToken
    }
};

const refreshAccessToken = async (refreshToken, req) => {
    const decoded = verifyRefreshToken(refreshToken);

    const existingUser = await usersRepo.getById(decoded.id);

    if (!existingUser) throw new AppError("User is not found!", 404);

    const refreshTokenHash = hashRefreshToken(refreshToken);

    // const existingUser = await usersRepo.getByRefreshToken(refreshTokenHash);

    const refreshFound = existingUser.refreshTokens.find(rt => rt.tokenHash === refreshTokenHash);

    if (!refreshFound) {
        await usersRepo.invalidateAllTokens(existingUser.id);
        throw new AppError("Refresh token reuse detected!", 403);   // Reuse detection
    }

    // if (!existingUser) throw new AppError("Refresh token reuse detected!", 403); // Reuse detection

    existingUser.refreshTokens = existingUser.refreshTokens.filter(rt => rt.tokenHash !== refreshTokenHash);    // Remove old token (rotation)

    const tokenPayload = mapUser(existingUser);

    const newAccessToken = generateAccessToken(tokenPayload, existingUser.id);

    const newRefreshToken = generateRefreshToken(tokenPayload, existingUser.id);    // Rotation

    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    existingUser.refreshTokens.push({
        tokenHash: newRefreshTokenHash,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + +unixRefreshExpiry),
        ip: req.ip
    });

    await usersRepo.bulkSave(existingUser);

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
        existingUser = await usersRepo.create({
            googleId: googleData.googleId,
            name: googleData.name,
            email: googleData.email,
            avatar: googleData.picture
        });
    }

    if (!existingUser.googleId) existingUser = await usersRepo.update(existingUser.id, { googleId: googleData.googleId, avatar: googleData.picture });  // Account linking

    const tokenPayload = mapUser(existingUser);

    const accessToken = generateAccessToken(tokenPayload, existingUser.id);

    const refreshToken = generateRefreshToken(tokenPayload, existingUser.id);

    const RefreshTokenHash = hashRefreshToken(refreshToken);

    existingUser.refreshTokens.push({
        tokenHash: RefreshTokenHash,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + +unixRefreshExpiry),
        ip: req.ip
    });

    await usersRepo.bulkSave(existingUser);

    return {
        user: tokenPayload,
        accessToken,
        refreshToken
    }
};

const logout = async (userId) => {
    const existingUser = await usersRepo.getById(userId);

    if (!existingUser) throw new AppError("User is not found!", 404);

    await usersRepo.update(existingUser.id, { refreshToken: null });
};


module.exports = {
    signUp,
    login,
    refreshAccessToken,
    findOrCreateGoogleUser,
    logout
};