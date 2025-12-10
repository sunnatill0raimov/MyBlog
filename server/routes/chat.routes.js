import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import chatController from '../controllers/chat.controller.js';

const router = express.Router();

// Access or create 1-on-1 chat
router.post('/', authenticate, chatController.accessChat);

// Fetch all chats for user
router.get('/', authenticate, chatController.fetchChats);

// Create Group Chat
router.post('/group', authenticate, chatController.createGroupChat);

// Search Groups (for joining)
router.get('/search', authenticate, chatController.searchGroups);

// Search all chats (individual and groups)
router.get('/search-all', authenticate, chatController.searchAllChats);

// Join Group (self-join)
router.put('/groupjoin', authenticate, chatController.joinGroup);

// Rename Group
router.put('/rename', authenticate, chatController.renameGroup);

// Add to Group
router.put('/groupadd', authenticate, chatController.addToGroup);

// Remove from Group
router.put('/groupremove', authenticate, chatController.removeFromGroup);

export default router;
