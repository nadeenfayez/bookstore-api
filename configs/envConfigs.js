process.loadEnvFile();

const PORT = process.env.PORT || 3000;
const bcryptSalt = process.env.BCRYPT_SALT;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;
const unixRefreshExpiry = process.env.UNIX_REFRESH_EXPIRY;
const booksFilePath = process.env.BOOKS_FILE_PATH;
const usersFilePath = process.env.USERS_FILE_PATH;
const mode = process.env.MODE;
const mongoURI = process.env.MONGO_URI;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const DBType = process.env.DB_TYPE;


module.exports = {
    PORT,
    bcryptSalt,
    accessTokenSecret,
    accessTokenExpiry,
    refreshTokenSecret,
    refreshTokenExpiry,
    unixRefreshExpiry,
    booksFilePath,
    usersFilePath,
    mode,
    mongoURI,
    googleClientId,
    DBType
};
