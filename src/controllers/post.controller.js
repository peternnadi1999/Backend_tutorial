const postService = require("../services/post.service");

const getPosts = async (req, res, next) => {
	try {
		const { page, limit } = req.validated.query;

		const result = await postService.getPosts(page, limit);

		return res.status(200).json({
			result,
		});
	} catch (error) {
		next(error);
	}
};

const getPostById = async (req, res, next) => {
	try {
		const post = await postService.getPostById(req.params.id);

		return res.status(200).json({
			post,
		});
	} catch (error) {
		next(error);
	}
};

const createPost = async (req, res, next) => {
	try {
		const { title, content } = req.body;
		const userId = req.user.id;

		const post = await postService.createPost(title, content, userId);

		return res.status(201).json({
			message: "Post created successfully",
			post,
		});
	} catch (error) {
		next(error);
	}
};

const updatePost = async (req, res, next) => {
	try {
		const { title, content } = req.body;
		const { id: userId, role } = req.user;
		const postId = req.params.id;

		const post = await postService.updatePost(
			postId,
			title,
			content,
			userId,
			role,
		);

		return res.status(200).json({
			message: "Post updated successfully",
			post,
		});
	} catch (error) {
		next(error);
	}
};

const deletePost = async (req, res, next) => {
	try {
		const { id: userId, role } = req.user;
		const postId = req.params.id;

		const deletedPost = await postService.deletePost(postId, userId, role);

		return res.status(200).json({
			message: "Post deleted successfully",
			post: deletedPost,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getPosts,
	getPostById,
	createPost,
	updatePost,
	deletePost,
};
