const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError(
                "Authentication required",
                401
            );
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new AppError(
                "Authentication required",
                401
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(
                new AppError(
                    "Invalid or expired token",
                    401
                )
            );
        }

        next(error);
    }
};

module.exports = authenticate;