import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} from "../controllers/notification.controller.js";

const router = express.Router();

// Get user's notifications
router.get("/", authenticateToken, getUserNotifications);

// Get unread notification count
router.get("/unread-count", authenticateToken, getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", authenticateToken, markNotificationAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", authenticateToken, markAllNotificationsAsRead);

export default router;
