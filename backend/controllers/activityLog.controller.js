// controllers/activityLog.controller.js
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { UserInteractionLog } from "../models/activityLog.model.js";
import { logActivity } from "../utils/logActivity.utils.js";

// ================== USER: GET MY ACTIVITY ==================
export const getMyActivityLogs = asyncHandler(async (req, res) => {
    try {
        const log = await UserInteractionLog.findOne({ user_id: req.user._id })
            .populate("user_id", "username email role");

        if (!log) {
            return res.status(404).json({ message: "No activity logs found for this user" });
        }

        // Return last 50 actions (latest first)
        const recentActivities = log.activities
            .slice(-50) // last 50
            .reverse() // show newest first
            .map(activity => ({
                event_id: activity._id,
                event_type: activity.event_type,
                user_id: log.user._id,
                session_id: activity.session_id,
                entity_type: activity.entity_type,
                entity_id: activity.entity_id,
                props: activity.props,
                timestamp: activity.createdAt
            }));

        res.status(200).json({ activities: recentActivities });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================== ADMIN: GET ALL ACTIVITY ==================
export const getAllActivityLogs = asyncHandler(async (req, res) => {
    try {
        const { userId, action } = req.query;

        let filter = {};
        if (userId) filter.user_id = userId;

        let logs = await UserInteractionLog.find(filter)
            .populate("user_id", "username email role");

        // Optional: filter activities by action
        if (action) {
            logs = logs.map((log) => ({
                ...log.toObject(),
                activities: log.activities.filter((a) => a.event_type === action).map(activity => ({
                    event_id: activity._id,
                    event_type: activity.event_type,
                    user_id: log.user._id,
                    session_id: activity.session_id,
                    entity_type: activity.entity_type,
                    entity_id: activity.entity_id,
                    props: activity.props,
                    timestamp: activity.createdAt
                })),
            }));
        } else {
            logs = logs.map((log) => ({
                ...log.toObject(),
                activities: log.activities.map(activity => ({
                    event_id: activity._id,
                    event_type: activity.event_type,
                    user_id: log.user._id,
                    session_id: activity.session_id,
                    entity_type: activity.entity_type,
                    entity_id: activity.entity_id,
                    props: activity.props,
                    timestamp: activity.createdAt
                })),
            }));
        }

        res.status(200).json({ logs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================== ADMIN: CLEAR USER LOGS ==================
export const clearUserLogs = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params; // userId

        const log = await UserInteractionLog.findOne({ user_id: id });
        if (!log) {
            return res.status(404).json({ message: "No logs found for this user" });
        }

        await logActivity(
            req.user._id,
            "clear-logs",
            `Admin ${req.user.fullName} cleared logs for user ${id}`,
            req,
            null, // entity_type
            null, // entity_id
            null, // session_id
            {} // additionalProps
        );

        log.activities = []; // clear the array
        await log.save();

        res.status(200).json({
            message: `Activity logs for user ${id} cleared successfully`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
