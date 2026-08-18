const { z } = require("zod");

const activityQuerySchema = z.object({
    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .default(20),

    cursor: z.string().optional(),
});

module.exports = {
    activityQuerySchema,
};