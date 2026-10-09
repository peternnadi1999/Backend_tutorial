const pool = require("../db/pool");
const AppError = require("../errors/AppError");
const postRepository = require("../repositories/post.repository");
const activityRepository = require("../repositories/activity.repository");
const withTransaction = require("../utils/transaction");
const { redisClient } = require("../db/redis");

const getPosts = async (page, limit) => {
	const postsResult = await postRepository.getPosts(page, limit);

	const total = await postRepository.getTotalPostsCount();

	const totalPages = Math.ceil(total / limit);

	return {
		data: postsResult,

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
	const cacheKey = `post:${postId}`;

	try {
		const cachedPost = await redisClient.get(cacheKey);

		if (cachedPost) {
			return JSON.parse(cachedPost);
		}
	} catch (error) {
		console.error("Redis GET failed:", error);
	}

	const post = await postRepository.getPostById(postId);

	if (!post) {
		throw new AppError("Post not found", 404, "POST_NOT_FOUND");
	}

	try {
		await redisClient.set(cacheKey, JSON.stringify(post), { EX: 60 });
	} catch (error) {
		console.error("Redis SET failed:", error);
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
	const cacheKey = `post:${postId}`;

	const updatedPost = await withTransaction(async (client) => {
		const post = await postRepository.getPostByIdForUpdate(client, postId);

		if (!post) {
			throw new AppError("Post not found", 404, "POST_NOT_FOUND");
		}

		const isOwner = post.user_id === userId;
		const isAdmin = role === "admin";

		if (!isOwner && !isAdmin) {
			throw new AppError(
				"You are not authorized to update this post",
				403,
				"POST_UPDATE_FORBIDDEN",
			);
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
	// Transaction has successfully committed at this point
	try {
		await redisClient.del(cacheKey);
	} catch (error) {
		console.error("Redis DEL failed:", error);
	}

	return updatedPost;
};
const deletePost = async (postId, userId, role) => {
	return withTransaction(async (client) => {
		const cacheKey = `post:${postId}`;

		const post = await postRepository.getPostByIdForUpdate(client, postId);

		if (!post) {
			throw new AppError("Post not found", 404, "POST_NOT_FOUND");
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

	await redisClient.del(cacheKey);
};

module.exports = {
	createPost,
	getPosts,
	getPostById,
	updatePost,
	deletePost,
};
