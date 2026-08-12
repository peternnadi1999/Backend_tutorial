const pool = require("../db/pool");
const bcrypt = require("bcrypt");

const register = async (name, email, role, password) => {
	const hashedPassword = await bcrypt.hash(password, 10);
	const result = await pool.query(
		`INSERT INTO users (name, email, role, password)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
		[name, email, role, hashedPassword],
	);

	const user = result.rows[0];

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};
};

const login = async (email, password) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
    );
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

module.exports = {
	register,
	login,
};
