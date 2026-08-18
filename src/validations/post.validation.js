const { z } = require("zod");

const postIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const postQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .default(10),
});

const postSchema = z.object({
    title: z
        .string()
        .trim()
        .min(5, "Title must be at least 5 characters"),
    content:z
        .string()
        .trim()
        .min(10, "Content must be at least 10 characters")
})

module.exports = {
    postIdSchema,
    postQuerySchema,
    postSchema
};