import Notification from "../models/Notification.js";

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username profileImage')
      .populate('artwork', 'title imageUrl')
      .populate('comment', 'content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total
      },
      unreadCount
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch notifications" 
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: "Notification not found" 
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to mark notification as read" 
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to mark all notifications as read" 
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get unread count" 
    });
  }
};

// Create notification (helper function for other controllers)
export const createNotification = async (recipientId, senderId, artworkId, type, commentId = null, content = null) => {
  try {
    // Don't create notification if sender is the same as recipient
    if (recipientId.toString() === senderId.toString()) {
      return null;
    }

    // Check if notification already exists for this action
    const existingNotification = await Notification.findOne({
      recipient: recipientId,
      sender: senderId,
      artwork: artworkId,
      type,
      comment: commentId
    });

    if (existingNotification) {
      return existingNotification;
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      artwork: artworkId,
      type,
      comment: commentId,
      content
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};
