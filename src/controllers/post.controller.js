const postService = require("../services/post.service");

const getPosts = async (req, res, next) => {
	try {
		const { page, limit } = req.validated.query;

        const result = await postService.getPosts(
            page,
            limit
        );

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

		 if (!post) {
            throw new AppError("Post not found", 404);
        }

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


		if (title === undefined && content === undefined) {
			return res.status(400).json({
				message: "At least one of title or content must be provided for update",
			});
		}

		// validate title
		if (!title?.trim() && title !== undefined) {
			return res.status(400).json({
				message: "Title is required",
			});
		}

		// validate content
		if (!content?.trim() && content !== undefined) {
			return res.status(400).json({
				message: "Content is required",
			});
		}

		const { id, role } = req.user;
		const post = await postService.getPostById(req.params.id);

		if (!post) {
			throw new AppError("Post not found", 404);
		}

		if (role !== "admin" && post.user_id !== id) {
			return res.status(403).json({
				message: "You are not authorized to update this post",
			});
		}

		const updatedPost = await postService.updatePost(postId, title, content, id);

		return res.status(200).json({
			message: "Post updated successfully",
			post: updatedPost,
		});
	} catch (error) {
		next(error);
	}
};

const deletePost = async (req, res, next) => {
    try {
        const { id, role } = req.user;

        // Your ownership/admin authorization
        const post = await postService.getPostById(req.params.id);

        if (!post) {
            throw new AppError("Post not found", 404);
        }

        if (role !== "admin" && post.user_id !== id) {
            return res.status(403).json({
                message: "You are not authorized to delete this post",
            });
        }

        const deletedPost = await postService.deletePost(
            postId,
            id
        );

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
