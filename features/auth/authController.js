const { refreshTokenTtlMs } = require("../../configs/envConfigs");
const handleAsyncError = require("../../middlewares/handleAsyncError");
const AppError = require("../../utils/AppError");
const authService = require("./authService");


const signUpController = handleAsyncError(async (req, res) => {
    const newUser = req.body;

    if (!newUser?.name || !newUser?.email || !newUser?.password) {  // HTTP-level validation
        throw new AppError("Name & email & password are required!", 400);
    }

    const { user, accessToken, refreshToken } = await authService.signUp(newUser, req);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/v1/auth",
        maxAge: refreshTokenTtlMs
    });

    res.status(201).json({
        success: true,
        user,
        accessToken
    });
});

const loginController = handleAsyncError(async (req, res) => {
    const credentials = req.body;

    if (!credentials.email || !credentials.password) {    // HTTP-level validation
        throw new AppError("Email & password are required!", 400);
    }

    const { user, accessToken, refreshToken } = await authService.login(credentials, req);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/v1/auth",
        maxAge: refreshTokenTtlMs
    });

    res.status(200).json({
        success: true,
        user,
        accessToken
    });
});

const refreshController = handleAsyncError(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) throw new AppError("refreshToken is required!", 400);  // HTTP-level validation

    const { newAccessToken, newRefreshToken } = await authService.refreshAccessToken(refreshToken, req);

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/v1/auth",
        maxAge: refreshTokenTtlMs
    });

    res.status(200).json({
        success: true,
        newAccessToken
    });
});

const googleLoginController = handleAsyncError(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) throw new AppError("idToken is required!", 400);  // HTTP-level validation

    const { user, accessToken, refreshToken } = await authService.findOrCreateGoogleUser(idToken, req);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/v1/auth",
        maxAge: refreshTokenTtlMs
    });

    res.status(200).json({
        success: true,
        user,
        accessToken
    });
});

const logoutController = handleAsyncError(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.sendStatus(204);  // Idempotency

    await authService.logout(refreshToken);

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/v1/auth",
        maxAge: refreshTokenTtlMs
    });

    res.sendStatus(204);
});

const logoutAllController = handleAsyncError(async (req, res) => {
    const { id } = req.currentUser;

    await authService.logoutAll(id);

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/v1/auth",
        maxAge: refreshTokenTtlMs
    });

    res.sendStatus(204);
});


module.exports = {
    signUpController,
    loginController,
    refreshController,
    googleLoginController,
    logoutController,
    logoutAllController
}