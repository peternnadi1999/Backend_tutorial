const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

const router = express.Router();

router.post("/auth/register", validate(registerSchema, "body"), authController.register);
router.post("/auth/login", validate(loginSchema, "body"), authController.login);

module.exports = router;