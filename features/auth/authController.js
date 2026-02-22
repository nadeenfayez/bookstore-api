const handleAsyncError = require("../../middlewares/handleAsyncError");
const authService = require("./authService");

const signUpController = handleAsyncError(async (req, res) => {
    const newUser = req.body;
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