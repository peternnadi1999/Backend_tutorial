const express = require("express");
const authenticate = require("../middleware/authenticate");
const activityController = require("../controllers/activity.controller");

const router = express.Router();

router.get(
    "/activities",
    authenticate,
    activityController.getActivities
);

module.exports = router;