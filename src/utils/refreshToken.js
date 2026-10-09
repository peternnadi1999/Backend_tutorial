const crypto = require("crypto");

const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
};

const hashRefreshToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

const getRefreshTokenExpiry = () => {
    const expiresAt = new Date();

    expiresAt.setDate(
        expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS
    );

    return expiresAt;
};

module.exports = {
    generateRefreshToken,
    hashRefreshToken,
    getRefreshTokenExpiry,
};