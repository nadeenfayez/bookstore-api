const { OAuth2Client } = require('google-auth-library');
const { googleClientId } = require('../configs/envConfigs');

const client = new OAuth2Client(googleClientId);

const verifyGoogleToken = async (idToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: googleClientId
        });

        const payload = ticket.getPayload();

        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            emailVerified: payload.email_verified
        }
    }
    catch (err) {
        console.error("Google token verification failed:", err);
        throw new AppError("Invalid or expired Google token.", 401);
    }

};


module.exports = verifyGoogleToken;