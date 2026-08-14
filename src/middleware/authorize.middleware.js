const AppError = require("../errors/AppError");

const authorize = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            return next(
                new AppError(
                    "You do not have permission to access this resource",
                    403
                )
            );
        }

        next();
    };
};

module.exports = authorize;