const userService = require("../services/user.service");

const getUsers = async (req, res) => {
	try {
		const users = await userService.getUsers();

		return res.status(200).json({
			users,
		});
	} catch (error) {
		console.error("Error fetching users:", error);

		return res.status(500).json({
			message: "Failed to fetch users",
		});
	}
};

const getUserById = async (req, res) => {
	try {
		const id = Number(req.params.id);

		if (Number.isNaN(id)) {
			return res.status(400).json({
				message: "Invalid user ID",
			});
		}

		const user = await userService.getUserById(id);

		if (!user) {
			return res.status(404).json({
				message: "User not found",
			});
		}

		return res.status(200).json({
			user,
		});
	} catch (error) {
		console.error("Error fetching user:", error);

		return res.status(500).json({
			message: "Failed to fetch user",
		});
	}
};

const createUser = async (req, res) => {
	try {
		const { name, job_title, email } = req.body;

		if (!name?.trim()) {
			return res.status(400).json({
				message: "Name is required",
			});
		}

		if (!job_title?.trim()) {
			return res.status(400).json({
				message: "Job title is required",
			});
		}

		if (!email?.trim()) {
			return res.status(400).json({
				message: "Email is required",
			});
		}

		const user = await userService.createUser(
			name.trim(),
			job_title.trim(),
			email.trim(),
		);

		return res.status(201).json({
			message: "User created successfully",
			user,
		});
	} catch (error) {
		console.error("Error creating user:", error);

		if (error.code === "23505") {
			return res.status(400).json({
				message: "Email already exists",
			});
		}

		if (error.code === "23502") {
			return res.status(400).json({
				message: "Required field is missing",
			});
		}

		return res.status(500).json({
			message: "Failed to create user",
		});
	}
};

const updateUser = async (req, res) => {
	try {
		const id = Number(req.params.id);

		if (Number.isNaN(id)) {
			return res.status(400).json({
				message: "Invalid user ID",
			});
		}

		const { name, job_title } = req.body;

		if (name === undefined && job_title === undefined) {
			return res.status(400).json({
				message: "Provide name or job title to update",
			});
		}

		if (name !== undefined && !name?.trim()) {
			return res.status(400).json({
				message: "Name cannot be empty",
			});
		}

		if (job_title !== undefined && !job_title?.trim()) {
			return res.status(400).json({
				message: "Job title cannot be empty",
			});
		}

		const user = await userService.updateUser(id, name?.trim(), job_title?.trim());

		if (!user) {
			return res.status(404).json({
				message: "User not found",
			});
		}

		return res.status(200).json({
			message: "User updated successfully",
			user,
		});
	} catch (error) {
		console.error("Error updating user:", error);

		return res.status(500).json({
			message: "Failed to update user",
		});
	}
};

const updateUserRole = async (req, res) => {
	try {
		const id = Number(req.params.id);

		if (Number.isNaN(id)) {
			return res.status(400).json({
				message: "Invalid user ID",
			});
		}

		const { role } = req.body;

		if (!role?.trim()) {
			return res.status(400).json({
				message: "Role is required",
			});
		}

		const allowedRoles = ["user", "admin"];

		if (!allowedRoles.includes(role?.trim())) {
			return res.status(400).json({
				message: "Invalid role. Role must be either 'admin' or 'user'",
			});
		}

		const user = await userService.updateUserRole(id, role);

		if (!user) {
			return res.status(404).json({
				message: "User not found",
			});
		}

		return res.status(200).json({
			message: "User role updated successfully",
			user,
		});
	} catch (error) {
		console.error("Error updating user role:", error);

		return res.status(500).json({
			message: "Failed to update user role",
		});
	}
};

const deleteUser = async (req, res) => {
	try {
		const id = Number(req.params.id);

		if (Number.isNaN(id)) {
			return res.status(400).json({
				message: "Invalid user ID",
			});
		}

		const user = await userService.deleteUser(id);

		if (!user) {
			return res.status(404).json({
				message: "User not found",
			});
		}

		return res.status(200).json({
			message: "User deleted successfully",
			user,
		});
	} catch (error) {
		console.error("Error deleting user:", error);

		return res.status(500).json({
			message: "Failed to delete user",
		});
	}
};

module.exports = {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	updateUserRole,
	deleteUser,
};
