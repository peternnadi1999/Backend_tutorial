const express = require("express");
const postController = require("../controllers/post.controller");
const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate");
const {
	postIdSchema,
	postUpdateSchema,
	postQuerySchema,
	postSchema,
} = require("../validations/post.validation");

const router = express.Router();

router.post(
	"/posts",
	authenticate,
	validate(postSchema, "body"),
	postController.createPost,
);
router.get(
	"/posts",
	authenticate,
	validate(postQuerySchema, "query"),
	postController.getPosts,
);
router.get(
	"/posts/:id",
	authenticate,
	validate(postIdSchema, "params"),
	postController.getPostById,
);
router.patch(
	"/posts/:id",
	authenticate,
	validate(postIdSchema, "params"),
	validate(postUpdateSchema, "body"),
	postController.updatePost,
);
router.delete(
	"/posts/:id",
	authenticate,
	validate(postIdSchema, "params"),
	postController.deletePost,
);

module.exports = router;
