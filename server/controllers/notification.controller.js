import Notification from '../models/notification.model.js';
import { handleError } from '../utils/errorHandler.js';

/**
 * Get all notifications for a user
 */
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: notifications,
            count: notifications.length
        });
    } catch (error) {
        handleError(res, error, 'Failed to fetch notifications');
    }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { $set: { isRead: true, updatedAt: Date.now() } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        handleError(res, error, 'Failed to mark notification as read');
    }
};

/**
 * Mark a notification as unread
 */
const markAsUnread = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { $set: { isRead: false, updatedAt: Date.now() } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        handleError(res, error, 'Failed to mark notification as unread');
    }
};

/**
 * Create a new notification
 */
const createNotification = async (req, res) => {
    try {
        const { userId, title, preview, type, referenceId } = req.body;

        if (!userId || !title || !preview) {
            return res.status(400).json({
                success: false,
                message: 'userId, title, and preview are required'
            });
        }

        const notification = new Notification({
            userId,
            title,
            preview,
            type: type || 'message',
            referenceId: referenceId || null
        });

        await notification.save();

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        handleError(res, error, 'Failed to create notification');
    }
};

/**
 * Delete a notification
 */
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndDelete({
            _id: id,
            userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        handleError(res, error, 'Failed to delete notification');
    }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true, updatedAt: Date.now() } }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        handleError(res, error, 'Failed to mark all notifications as read');
    }
};

export {
    getUserNotifications,
    markAsRead,
    markAsUnread,
    createNotification,
    deleteNotification,
    markAllAsRead
};
