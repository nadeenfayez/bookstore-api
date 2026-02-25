const handleAsyncError = require("../../middlewares/handleAsyncError");
const AppError = require("../../utils/AppError");
const authService = require("./authService");


const signUpController = handleAsyncError(async (req, res) => {
    const newUser = req.body;

    if (!newUser?.name || !newUser?.email || !newUser?.password) {  // HTTP-level validation
        throw new AppError("Name & email & password are required!", 400);
    }

    const { user, token } = await authService.signUp(newUser);

    res.cookie("token", token, {
        httpOnly: true
    });

    res.status(201).json({
        success: true,
        user
    });
});

const loginController = handleAsyncError(async (req, res) => {
    const credentials = req.body;

    if (!credentials.email || !credentials.password) {    // HTTP-level validation
        throw new AppError("Email & password are required!", 400);
    }

    const { user, token } = await authService.login(credentials);

    res.cookie("token", token, {
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        user
    });
});

const googleLoginController = handleAsyncError(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) throw new AppError("idToken is required!", 400);  // HTTP-level validation

    const { user, token } = await authService.findOrCreateGoogleUser(idToken);

    res.cookie("token", token, {
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        user
    });
});


module.exports = {
    signUpController,
    loginController,
    googleLoginController
}