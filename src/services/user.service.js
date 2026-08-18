const pool = require("../db/pool");

const getUsers = async () => {
	const result = await pool.query("SELECT * FROM users");

	return {
		users: result.rows.map((user) => ({
			id: user.id,
			name: user.name,
			job_title: user.job_title,
			email: user.email,
		})),
	};
};

const getUserById = async (id) => {
	const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

	const user = result.rows[0];

	 if (!result.rows[0]) {
        throw new AppError("User not found", 404);
    }

	return {
		id: user.id,
		name: user.name,
		job_title: user.job_title,
		email: user.email,
	};
};

const createUser = async (name, job_title, email) => {
	const result = await pool.query(
		`INSERT INTO users (name, job_title, email)
         VALUES ($1, $2, $3)
         RETURNING *`,
		[name, job_title, email],
	);

	if (!result.rows[0]) {
		throw new AppError("Failed to create user", 500);
	}

	return result.rows[0];
};

const updateUser = async (id, name, job_title) => {
	const fields = [];
	const values = [];

	if (name !== undefined) {
		fields.push(`name = $${values.length + 1}`);
		values.push(name.trim());
	}

	if (job_title !== undefined) {
		fields.push(`job_title = $${values.length + 1}`);
		values.push(job_title.trim());
	}

	const idPlaceholder = values.length + 1;

	values.push(id);

	const result = await pool.query(
		`UPDATE users
         SET ${fields.join(", ")}
         WHERE id = $${idPlaceholder}
         RETURNING *`,
		values,
	);

	const user = result.rows[0];

	if (!user) {
		throw new AppError("User not found", 404);
	}

	return {
		id: user.id,
		name: user.name,
		job_title: user.job_title,
		email: user.email,
	};
};

const updateUserRole = async (id, role) => {
	const result = await pool.query(
		`UPDATE users
         SET role = $1
         WHERE id = $2
         RETURNING id, name, email, job_title, role`,
		[role, id],
	);

	if (!result.rows[0]) {
		throw new AppError("User not found", 404);
	}
	return result.rows[0];
};

const deleteUser = async (id) => {
	const result = await pool.query(
		"DELETE FROM users WHERE id = $1 RETURNING *",
		[id],
	);

	const user = result.rows[0];

	if (!user) {
		throw new AppError("User not found", 404);
	}
	return {
		id: user.id,
		name: user.name,
		job_title: user.job_title,
		email: user.email,
	};
};

const createUserWithProfile = async (name, job_title, email, profile) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		const userResult = await client.query(
			`INSERT INTO users (name, job_title, email)
             VALUES ($1, $2, $3)
             RETURNING *`,
			[name, job_title, email],
		);

		const userId = userResult.rows[0].id;

		await client.query(
			`INSERT INTO profiles (user_id, profile_data)
             VALUES ($1, $2)`,
			[userId, profile],
		);

		await client.query("COMMIT");

		return {
			id: userResult.rows[0].id,
			name: userResult.rows[0].name,
			job_title: userResult.rows[0].job_title,
			email: userResult.rows[0].email,
		};
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
};
module.exports = {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	updateUserRole,
	deleteUser,
	createUserWithProfile,
};
