const errorHandler = (err, req, res, next) => {
    console.error(err);

    // PostgreSQL unique constraint violation
    if (err.code === "23505") {
        return res.status(409).json({
            message: "Resource already exists",
        });
    }

    // PostgreSQL foreign key violation
    if (err.code === "23503") {
        return res.status(400).json({
            message: "Referenced resource does not exist",
        });
    }

    // PostgreSQL not-null violation
    if (err.code === "23502") {
        return res.status(400).json({
            message: "Required field is missing",
        });
    }

    // Application errors
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            message: err.message,
            ...(err.errors && { errors: err.errors }),
        });
    }

    // Unknown/unexpected errors
    return res.status(500).json({
        message: "Internal server error",
    });
};

module.exports = errorHandler;