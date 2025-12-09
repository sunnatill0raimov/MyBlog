import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication needed)
router.get('/profile/:username', userController.getUserByUsername);

// All routes below require authentication
router.use(authenticate);

// Admin routes
router.get('/', authorize('admin'), userController.getUsers);
router.put('/:id', authorize('admin'), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

// Protected routes (authenticated users)
router.get('/:id', userController.getUser);

export default router;
