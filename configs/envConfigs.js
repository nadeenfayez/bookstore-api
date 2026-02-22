process.loadEnvFile();

const PORT = process.env.PORT || 3000;
const bcryptSalt = process.env.BCRYPT_SALT;
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
const booksFilePath = process.env.BOOKS_FILE_PATH;
const usersFilePath = process.env.USERS_FILE_PATH;
const mode = process.env.MODE;
const mongoURI = process.env.MONGO_URI;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const DBType = process.env.DB_TYPE;


module.exports = {
    PORT,
    bcryptSalt,
    jwtSecret,
    jwtExpiresIn,
    booksFilePath,
    usersFilePath,
    mode,
    mongoURI,
    googleClientId,
    DBType
};
