const Notification = require('../models/notification.model');

/**
 * Create a system notification
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} preview - Notification preview text
 * @param {string} type - Notification type
 * @param {string} referenceId - Reference ID
 * @returns {Promise<Object>} Created notification
 */
const createSystemNotification = async (userId, title, preview, type = 'system', referenceId = null) => {
    try {
        const notification = new Notification({
            userId,
            title,
            preview,
            type,
            referenceId
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating system notification:', error);
        throw error;
    }
};

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
const getUnreadCount = async (userId) => {
    try {
        return await Notification.countDocuments({
            userId,
            isRead: false
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
};

/**
 * Get recent notifications for a user
 * @param {string} userId - User ID
 * @param {number} limit - Limit number of results
 * @returns {Promise<Array>} Recent notifications
 */
const getRecentNotifications = async (userId, limit = 5) => {
    try {
        return await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        console.error('Error getting recent notifications:', error);
        return [];
    }
};

/**
 * Clean up old notifications
 * @param {number} days - Days to keep notifications
 * @returns {Promise<Object>} Deletion result
 */
const cleanupOldNotifications = async (days = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return await Notification.deleteMany({
            createdAt: { $lt: cutoffDate }
        });
    } catch (error) {
        console.error('Error cleaning up old notifications:', error);
        throw error;
    }
};

module.exports = {
    createSystemNotification,
    getUnreadCount,
    getRecentNotifications,
    cleanupOldNotifications
};
