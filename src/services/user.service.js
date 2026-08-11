const pool = require("../db/pool");

const getUsers = async () => {
    const result = await pool.query("SELECT * FROM users");

    return result.rows;
};

const getUserById = async (id) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id]
    );

    return result.rows[0];
};

const createUser = async (name, role, email) => {
    const result = await pool.query(
        `INSERT INTO users (name, role, email)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, role, email]
    );

    return result.rows[0];
};

const updateUser = async (id, name, role) => {
    const fields = [];
    const values = [];

    if (name !== undefined) {
        fields.push(`name = $${values.length + 1}`);
        values.push(name.trim());
    }

    if (role !== undefined) {
        fields.push(`role = $${values.length + 1}`);
        values.push(role.trim());
    }

    const idPlaceholder = values.length + 1;

    values.push(id);

    const result = await pool.query(
        `UPDATE users
         SET ${fields.join(", ")}
         WHERE id = $${idPlaceholder}
         RETURNING *`,
        values
    );

    return result.rows[0];
};

const deleteUser = async (id) => {
    const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};