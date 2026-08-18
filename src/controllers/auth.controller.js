const authService = require("../services/auth.service");

const register = async (req, res, next) => {
	try {
		const { name, email, job_title, password } = req.body;

		const user = await authService.register(name, email, job_title, password);

		return res.status(201).json({
			message: "User registered successfully",
			user,
		});
	} catch (error) {
		next(error);
	}
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;   

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
       next(error);
    }
};

module.exports = {
	register,
	login,
};
