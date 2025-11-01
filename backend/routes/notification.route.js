import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationsCount
} from "../controllers/notification.controller.js";

const router = express.Router();

// All routes are protected
router.route("/").get(verifyJWT, getUserNotifications);
router.route("/unread-count").get(verifyJWT, getUnreadNotificationsCount);
router.route("/mark-all-read").put(verifyJWT, markAllNotificationsAsRead);
router.route("/:id/read").put(verifyJWT, markNotificationAsRead);
router.route("/:id").delete(verifyJWT, deleteNotification);

export default router;