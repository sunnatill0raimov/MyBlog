import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import messageController from '../controllers/message.controller.js';

const router = express.Router();

// Get all messages for a chat
router.get('/:chatId', authenticate, messageController.allMessages);

// Send a message
router.post('/', authenticate, messageController.sendMessage);

export default router;
