const { Pool } = require("pg");

const pool = new Pool({
  user: "backend_user",
  host: "localhost",
  database: "backend_course",
  password: "backend_password",
  port: 5432,
});

module.exports = pool;