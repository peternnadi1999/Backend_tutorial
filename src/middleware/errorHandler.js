const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
    console.error(err);

      // Zod validation errors
    if (err instanceof ZodError) {
        const errors = {};

        for (const issue of err.issues) {
            const field = issue.path.join(".");

            errors[field] = issue.message;
        }

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    // PostgreSQL unique constraint
    if (err.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "Resource already exists",
        });
    }

    // PostgreSQL foreign key violation
    if (err.code === "23503") {
        return res.status(400).json({
            success: false,
            message: "Referenced resource does not exist",
        });
    }

    // PostgreSQL NOT NULL violation
    if (err.code === "23502") {
        return res.status(400).json({
            success: false,
            message: "Required field is missing",
        });
    }

    // Operational/application errors
    if (err.isOperational) {
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        code: err.code,
    });
}

    // Unexpected errors
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};

module.exports = errorHandler;