const postService = require("../services/post.service");

const getPosts = async (req, res) => {
	try {
		const posts = await postService.getPosts();

		return res.status(200).json({
			posts,
		});
	} catch (error) {
		console.error("Error fetching posts:", error);

		return res.status(500).json({
			message: "Failed to fetch posts",
		});
	}
};

const getPostById = async (req, res) => {
	try {
		const postId = Number(req.params.id);

		if (isNaN(postId)) {
			return res.status(400).json({
				message: "Invalid post ID",
			});
		}

		const post = await postService.getPostById(postId);

		if (!post) {
			return res.status(404).json({
				message: "Post not found",
			});
		}

		return res.status(200).json({
			post,
		});
	} catch (error) {
		next(error);
	}
};

const createPost = async (req, res) => {
	try {
		const { title, content } = req.body;
		const userId = req.user.id;

		// validate title
		if (!title?.trim()) {
			return res.status(400).json({
				message: "Title is required",
			});
		}
		if (title.trim().length < 5) {
			return res.status(400).json({
				message: "Title must be at least 5 characters",
			});
		}
		// validate content
		if (!content?.trim()) {
			return res.status(400).json({
				message: "Content is required",
			});
		}
		if (content.trim().length < 10) {
			return res.status(400).json({
				message: "Content must be at least 10 characters",
			});
		}
		const post = await postService.createPost(title, content, userId);

		return res.status(201).json({
			message: "Post created successfully",
			post,
		});
	} catch (error) {
		console.error("Error creating post:", error);
		return res.status(500).json({
			message: "Failed to create post",
		});
	}
};

const updatePost = async (req, res) => {
	try {
		const postId = Number(req.params.id);
		const { title, content } = req.body;

		if (isNaN(postId)) {
			return res.status(400).json({
				message: "Invalid post ID",
			});
		}

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
		const post = await postService.getPostById(postId);

		if (!post) {
			return res.status(404).json({
				message: "Post not found",
			});
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
		console.error("Error updating post:", error);
		return res.status(500).json({
			message: "Failed to update post",
		});
	}
};

const deletePost = async (req, res) => {
    try {
        const postId = Number(req.params.id);

        if (isNaN(postId)) {
            return res.status(400).json({
                message: "Invalid post ID",
            });
        }

        const { id, role } = req.user;

        // Your ownership/admin authorization
        const post = await postService.getPostById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
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
        console.error("Error deleting post:", error);

        return res.status(500).json({
            message: "Failed to delete post",
        });
    }
};

module.exports = {
	getPosts,
	getPostById,
	createPost,
	updatePost,
	deletePost,
};
