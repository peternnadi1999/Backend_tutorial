const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");

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

module.exports = {
	register,
	login,
};
