const pool = require("../db/pool");
const AppError = require("../errors/AppError");
const postRepository = require("../repositories/post.repository");
const activityRepository = require("../repositories/activity.repository");
const withTransaction = require("../utils/transaction");

const getPosts = async (page, limit) => {
	const offset = (page - 1) * limit;

	const postsResult = await pool.query(
		`
        SELECT
            posts.id,
            posts.title,
            posts.content,
            posts.user_id,
            users.name AS author_name,
            users.email AS author_email
        FROM posts
        JOIN users
            ON posts.user_id = users.id
        ORDER BY posts.id DESC
        LIMIT $1
        OFFSET $2
        `,
		[limit, offset],
	);

	const countResult = await pool.query(
		`
        SELECT COUNT(*) AS total
        FROM posts
        `,
	);

	const total = Number(countResult.rows[0].total);

	const totalPages = Math.ceil(total / limit);

	return {
		data: postsResult.rows,

		pagination: {
			page,
			limit,
			total,
			totalPages,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		},
	};
};

const getPostById = async (postId) => {
	const post = await postRepository.getPostById(postId);

	if (!post) {
		throw new AppError("Post not found", 404);
	}
	return post;
};

const createPost = async (title, content, userId) => {
	return withTransaction(async (client) => {
		const post = await postRepository.createPost(
			client,
			title,
			content,
			userId,
		);

		await activityRepository.createActivity(
			client,
			userId,
			post.id,
			"created_post",
		);

		return post;
	});
};

const updatePost = async (postId, title, content, userId, role) => {
	return withTransaction(async (client) => {
		const post = await postRepository.getPostByIdForUpdate(client, postId);

		if (!post) {
			throw new AppError("Post not found", 404);
		}

		const isOwner = post.user_id === userId;
		const isAdmin = role === "admin";

		if (!isOwner && !isAdmin) {
			throw new AppError("You are not authorized to update this post", 403);
		}

		const updatedPost = await postRepository.updatePost(
			client,
			postId,
			title,
			content,
		);

		await activityRepository.createActivity(
			client,
			userId,
			postId,
			"updated_post",
		);

		return updatedPost;
	});
};
const deletePost = async (postId, userId, role) => {
	return withTransaction(async (client) => {
		const post = await postRepository.getPostByIdForUpdate(client, postId);

		if (!post) {
			throw new AppError("Post not found", 404);
		}

		if (role !== "admin" && post.user_id !== userId) {
			throw new AppError("You cannot delete this post", 403);
		}

		const deleteResult = await postRepository.deletePost(client, postId);

		await activityRepository.createActivity(
			client,
			userId,
			postId,
			"deleted_post",
		);

		return deleteResult;
	});
};

module.exports = {
	createPost,
	getPosts,
	getPostById,
	updatePost,
	deletePost,
};
