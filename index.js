const express = require("express");
const pool = require("./db");

const app = express();

const PORT = 3001;

app.use(express.json());



app.get("/users", async (req, res) => {
	try {
		const result = await pool.query("SELECT * FROM users");

		return res.status(200).json({ users: result.rows });
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch users" });
	}
});

app.get("/users/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (isNaN(id)) {
			return res.status(400).json({
				message: "Invalid user ID",
			});
		}
		const users = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

		if (users.rows.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.status(200).json(users.rows[0]);
	} catch (error) {
		return res.status(500).json({ message: "Failed to fetch user" });
	}
});

app.post("/users", async (req, res) => {
	try {
		const { name, role } = req.body;

		if (!name?.trim()) {
			return res.status(400).json({ message: "Name is required" });
		} else if (!role?.trim()) {
			return res.status(400).json({ message: "Role is required" });
		}

		const result = await pool.query(
			"INSERT INTO users (name, role) VALUES ($1, $2) RETURNING *",
			[name, role],
		);

		return res
			.status(201)
			.json({ message: "User created successfully", user: result.rows[0] });
	} catch (error) {
		return res.status(500).json({ message: "Failed to create user" });
	}
});

app.patch("/users/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				message: "Invalid user ID",
			});
		}

		const { name, role } = req.body;

		if (name === undefined && role === undefined) {
			return res.status(400).json({
				message: "Provide name or role to update",
			});
		}

		if (name !== undefined && !name?.trim()) {
			return res.status(400).json({
				message: "Name cannot be empty",
			});
		}

		if (role !== undefined && !role?.trim()) {
			return res.status(400).json({
				message: "Role cannot be empty",
			});
		}

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
		const user = await pool.query(
			`UPDATE users SET ${fields.join(", ")} WHERE id = $${idPlaceholder} RETURNING *`,
			values,
		);

		if (!user.rows[0]) {
			return res.status(404).json({
				message: "User not found",
			});
		}

		return res.status(200).json({
			message: "User updated successfully",
			user: user.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to update user" });
	}
});

app.delete("/users/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);

		if (isNaN(id)) {
			return res.status(400).json({
				message: "Invalid user ID",
			});
		}

		const result = await pool.query(
			"DELETE FROM users WHERE id = $1 RETURNING *",
			[id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({
				message: "User not found",
			});
		}

		return res.status(200).json({
			message: "User deleted successfully",
			user: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({ message: "Failed to delete user" });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
