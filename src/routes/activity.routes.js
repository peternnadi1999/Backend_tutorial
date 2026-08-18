const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const activityController = require("../controllers/activity.controller");
const validate = require("../middleware/validate");
const { activityQuerySchema } = require("../validations/activities.validation");

const router = express.Router();

router.get(
    "/activities",
    authenticate,
    activityController.getActivities
);
router.get(
    "/activities/me",
    authenticate,
    validate(activityQuerySchema, "query"),
    activityController.getMyActivities
);

module.exports = router;