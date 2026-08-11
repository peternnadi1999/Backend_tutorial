const pool = require("../db/pool");
const bycrypt = require("bcrypt");


const register = async (name, email, password) => {
    const hashedPassword = await bycrypt.hash(password, 10);
    const result = await pool.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, email, hashedPassword]
    );

    result.rows[0].password = undefined; // Remove password from the returned user object
    return result.rows[0];
};

module.exports = {  
    register,
}