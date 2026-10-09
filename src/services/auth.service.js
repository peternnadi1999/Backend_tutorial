const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");
const refreshTokenRepository = require("../repositories/refreshToken.repository");
const userRepository = require("../repositories/user.repository");
const withTransaction = require("../utils/transaction");
const {generateRefreshToken, hashRefreshToken} = require("../utils/refreshToken");

const register = async (name, email, job_title, password) => {
	const hashedPassword = await bcrypt.hash(password, 10);
	const result = await pool.query(
		`INSERT INTO users (name, email, job_title, password)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
		[name, email, job_title, hashedPassword],
	);

	const user = result.rows[0];

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		job_title: user.job_title,
	};
};

const login = async (email, password) => {
	const result = await pool.query("SELECT * FROM users WHERE email = $1", [
		email,
	]);
	const user = result.rows[0];

	if (!user) {
		throw new AppError("Invalid credentials", 401);
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw new AppError("Invalid credentials", 401);
	}

	const token = jwt.sign(
		{
			id: user.id,
			email: user.email,
			role: user.role,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: "1h",
		},
	);

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
		},
		token,
	};
};

const refreshAccessToken = async (rawRefreshToken) => {
    if (!rawRefreshToken) {
        throw new AppError(
            "Refresh token is required",
            401
        );
    }

    // Hash the token received from the client
    const tokenHash = hashRefreshToken(rawRefreshToken);

    // Find the session
    const session =
        await refreshTokenRepository.findSessionByTokenHash(
            tokenHash
        );

    if (!session) {
        throw new AppError(
            "Invalid refresh token",
            401
        );
    }

    // Check if token has already been revoked
    if (session.revoked_at) {
        throw new AppError(
            "Refresh token has been revoked",
            401
        );
    }

    // Check expiration
    if (new Date(session.expires_at) <= new Date()) {
        throw new AppError(
            "Refresh token has expired",
            401
        );
    }

    // Find the user
    const user =
        await userRepository.getUserById(session.user_id);

    if (!user) {
        throw new AppError(
            "User not found",
            401
        );
    }

    // Create a new access token
    const accessToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        }
    );

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken();

    const newTokenHash =
        hashRefreshToken(newRefreshToken);

    const expiresAt = getRefreshTokenExpiry();

    // Rotate refresh token
    await withTransaction(async (client) => {
		 await refreshTokenRepository.findSessionForUpdate(
            client,
            tokenHash
        );

        await refreshTokenRepository.revokeSession(
            client,
            session.id
        );

        await refreshTokenRepository.createSession(
            client,
            user.id,
            newTokenHash,
            expiresAt
        );
    });

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
};

module.exports = {
	register,
	login,
	refreshAccessToken,
};
