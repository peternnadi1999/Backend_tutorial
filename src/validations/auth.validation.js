const { z } = require("zod");

const registerSchema = z.object({
	name: z
		.string({
			error: "Name is required",
		})
		.trim()
		.min(2, "Name must be at least 2 characters"),

	email: z
		.string({
			error: "Email is required",
		})
		.trim()
		.email("Invalid email address"),

	password: z
		.string({
			error: "Password is required",
		})
		.min(8, "Password must be at least 8 characters"),

	job_title: z
		.string({ error: "Job title is required" })
		.trim()
		.min(2, "Job title must be at least 2 characters"),
});

const loginSchema = z.object({
	email: z
		.string({
			error: "Email is required",
		})
		.trim()
		.email("Invalid email address"),

	password: z
		.string({
			error: "Password is required",
		})
		.min(1, "Password is required"),
});

module.exports = {
	registerSchema,
	loginSchema,
};
