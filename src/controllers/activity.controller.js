const activityService = require("../services/activity.service");
const {
    encodeCursor,
    decodeCursor,
} = require("../utils/cursor");

const getActivities = async (req, res, next) => {
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
        next(error);
    }
};



const getMyActivities = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const { limit, cursor: cursorString } = req.query;

        let cursor = null;

        if (cursorString) {
            cursor = decodeCursor(cursorString);
        }

        const rows = await activityService.getUserActivities(
            userId,
            limit,
            cursor
        );

        const hasMore = rows.length > limit;

        const activities = hasMore
            ? rows.slice(0, limit)
            : rows;

        let nextCursor = null;

        if (hasMore) {
            const lastActivity =
                activities[activities.length - 1];

            nextCursor = encodeCursor({
                createdAt: lastActivity.created_at,
                id: lastActivity.id,
            });
        }

        return res.status(200).json({
            activities,
            nextCursor,
            hasMore,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getActivities,
    getMyActivities
};