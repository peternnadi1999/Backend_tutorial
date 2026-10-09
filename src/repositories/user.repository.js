const pool = require("../db/pool");

const getUserById = async (id) => {
	const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
	return result.rows[0];
};

const getUserByEmail = async (email) => {
	const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
	return result.rows[0];
};

const createUser = async (name, email, job_title, password) => {
	const result = await pool.query(
		`INSERT INTO users (name, email, job_title, password)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
		[name, email, job_title, password]
	);
	return result.rows[0];
};

module.exports = {
	getUserById,
	getUserByEmail,
	createUser,
};
