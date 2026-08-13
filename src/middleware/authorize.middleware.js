const authorize = (requiredRole) => {
    return (req, res, next) => {
        console.log("User role:", req.user?.role);
        if (!req.user || req.user?.role !== requiredRole) {
            return res.status(403).json({
                message: "Forbidden: You do not have the required role to access this resource",
            });
        }

        next();
    };
};

module.exports = authorize;