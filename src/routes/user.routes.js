const express = require("express");

const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");

const router = express.Router();

router.get("/users",authenticate, userController.getUsers);
router.get("/users/:id", userController.getUserById);
router.post("/users", userController.createUser);
router.patch("/users/:id", userController.updateUser);
router.patch("/users/:id/role", authenticate, authorize("admin"), userController.updateUserRole);
router.delete("/users/:id",authenticate, authorize("admin"), userController.deleteUser);


module.exports = router;