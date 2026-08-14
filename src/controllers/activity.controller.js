const activityService = require("../services/activity.service");

const getActivities = async (req, res) => {
    try {
        const { id, role } = req.user;

        const isAdmin = role === "admin";

        const activities = await activityService.getActivities(
            id,
            isAdmin
        );

        return res.status(200).json({
            activities,
        });

    } catch (error) {
        console.error("Error fetching activities:", error);

        return res.status(500).json({
            message: "Failed to fetch activities",
        });
    }
};

module.exports = {
    getActivities,
};