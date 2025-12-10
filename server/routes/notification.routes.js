import express from 'express';
import {
    getUserNotifications,
    markAsRead,
    markAsUnread,
    createNotification,
    deleteNotification,
    markAllAsRead
} from '../controllers/notification.controller.js';

const router = express.Router();

// Notification routes
router.get('/', getUserNotifications);
router.post('/', createNotification);
router.patch('/:id/read', markAsRead);
router.patch('/:id/unread', markAsUnread);
router.delete('/:id', deleteNotification);
router.patch('/mark-all-read', markAllAsRead);

export default router;
