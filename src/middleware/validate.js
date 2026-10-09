const AppError = require("../errors/AppError");

const validate = (schema, property = "body") => {
    return (req, res, next) => {
        const result = schema.safeParse(req[property]);

        if (!result.success) {
            const errors = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path[0];

                if (!errors[field]) {
                    errors[field] = issue.message;
                }
            });

            return next(
                new AppError("Validation failed", 400, errors)
            );
        }

        req.validated = req.validated || {};
        req.validated[property] = result.data;

        next();
    };
};

module.exports = validate;