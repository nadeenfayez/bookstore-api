process.loadEnvFile();

const port = process.env.PORT || 3000;
const bcryptSalt = +process.env.BCRYPT_SALT;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;
const refreshTokenTtlMs = +process.env.REFRESH_TOKEN_TTL_MS;
const maxRefreshTokens = +process.env.MAX_REFRESH_TOKENS || 5;
const booksFilePath = process.env.BOOKS_FILE_PATH;
const usersFilePath = process.env.USERS_FILE_PATH;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const clientUrl = process.env.CLIENT_URL;
const geminiApiKey = process.env.GEMINI_API_KEY;
const redisUrl = process.env.REDIS_URL;
const nodeEnv = process.env.NODE_ENV;
const mongoURI = process.env.MONGO_URI;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const DBType = process.env.DB_TYPE;


module.exports = {
    port,
    bcryptSalt,
    accessTokenSecret,
    accessTokenExpiry,
    refreshTokenSecret,
    refreshTokenExpiry,
    refreshTokenTtlMs,
    maxRefreshTokens,
    booksFilePath,
    usersFilePath,
    stripeSecretKey,
    stripeWebhookSecret,
    clientUrl,
    geminiApiKey,
    redisUrl,
    nodeEnv,
    mongoURI,
    googleClientId,
    DBType
};
