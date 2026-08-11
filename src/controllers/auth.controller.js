const authService = require("../services/auth.service");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                message: "Name is required",
            });
        }

        if (!email?.trim()) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        if (!password?.trim()) {
            return res.status(400).json({
                message: "Password is required",
            });
        }

        const user = await authService.registerUser(name, email, password);

        return res.status(201).json({
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        console.error("Error registering user:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email already exists",
            });
        }

        return res.status(500).json({
            message: "Failed to register user",
        });
    }
};

module.exports = {
    register,
};