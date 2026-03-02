const crypto = require("crypto");

const hashRefreshToken = (refreshtoken) => {
    return crypto.createHash("sha256").update(refreshtoken).digest("hex");
};


module.exports = {
    hashRefreshToken
};