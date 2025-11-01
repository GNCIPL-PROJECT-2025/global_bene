import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Get notifications for user
export const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20, isRead } = req.query;

    const filter = { user: userId };
    if (isRead !== undefined) {
        filter.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(filter)
        .populate('relatedPost', 'title')
        .populate('relatedComment', 'content')
        .populate('relatedCommunity', 'name')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalNotifications = await Notification.countDocuments(filter);

    res.status(200).json(new ApiResponse(200, {
        notifications,
        totalPages: Math.ceil(totalNotifications / limit),
        currentPage: page,
        totalNotifications
    }, "Notifications fetched successfully"));
});

// Mark notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, user: userId });
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(new ApiResponse(200, notification, "Notification marked as read"));
});

// Mark all notifications as read
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

    res.status(200).json(new ApiResponse(200, null, "All notifications marked as read"));
});

// Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, user: userId });
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Notification deleted successfully"));
});

// Get unread notifications count
export const getUnreadNotificationsCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const count = await Notification.countDocuments({ user: userId, isRead: false });

    res.status(200).json(new ApiResponse(200, { count }, "Unread notifications count fetched successfully"));
});