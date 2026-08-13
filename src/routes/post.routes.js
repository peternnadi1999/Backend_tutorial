const express = require("express");
const postController = require("../controllers/post.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/posts", authenticate, postController.createPost);
router.get("/posts", authenticate, postController.getPosts);
router.get("/posts/:id", authenticate, postController.getPostById);
router.patch("/posts/:id", authenticate, postController.updatePost);
router.delete("/posts/:id", authenticate, postController.deletePost);


module.exports = router;
