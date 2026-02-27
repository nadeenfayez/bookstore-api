const handleAsyncError = require("../../middlewares/handleAsyncError");
const AppError = require("../../utils/AppError");
const authService = require("./authService");


const signUpController = handleAsyncError(async (req, res) => {
    const newUser = req.body;

    if (!newUser?.name || !newUser?.email || !newUser?.password) {  // HTTP-level validation
        throw new AppError("Name & email & password are required!", 400);
    }

    const { user, accessToken } = await authService.signUp(newUser);

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

    const { user, accessToken } = await authService.login(credentials);

    res.status(200).json({
        success: true,
        user,
        accessToken
    });
});

const googleLoginController = handleAsyncError(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) throw new AppError("idToken is required!", 400);  // HTTP-level validation

    const { user, accessToken } = await authService.findOrCreateGoogleUser(idToken);

    res.status(200).json({
        success: true,
        user,
        accessToken
    });
});


module.exports = {
    signUpController,
    loginController,
    googleLoginController
}