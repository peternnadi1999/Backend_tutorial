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

const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const result = await authService.refreshAccessToken(
            refreshToken
        );

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/api/auth",
        });

        return res.status(200).json({
            accessToken: result.accessToken,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
	register,
	login,
    refreshAccessToken,
};
