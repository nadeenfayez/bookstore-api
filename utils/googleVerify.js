const { OAuth2Client } = require('google-auth-library');
const { googleClientId } = require('../configs/envConfigs');

const client = new OAuth2Client(googleClientId);

const verifyGoogleToken = async (idToken) => {
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
};


module.exports = verifyGoogleToken;