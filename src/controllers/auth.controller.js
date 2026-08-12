const authService = require("../services/auth.service");

const register = async (req, res) => {
	try {
		const { name, email, role, password } = req.body;

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

		if (!role?.trim()) {
			return res.status(400).json({
				message: "Role is required",
			});
		}

        if (!password?.trim()) {
            return res.status(400).json({
                message: "Password is required",
            });
        }

		if (password.trim().length < 8) {
			return res.status(400).json({
				message: "Password must be at least 8 characters",
			});
		}

		const user = await authService.register(name, email, role, password);

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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;   

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

        const user = await authService.login(email, password);

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        return res.status(200).json({
            message: "User logged in successfully",
            user,
        });
    } catch (error) {
        console.error("Error logging in user:", error);

        return res.status(401).json({
            message: "Invalid credentials",
        });
    }
};

module.exports = {
	register,
	login,
};
