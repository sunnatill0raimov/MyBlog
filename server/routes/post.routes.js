import express from 'express';
import postController from '../controllers/post.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication needed)
router.get('/', postController.getPosts);
router.get('/:slug', postController.getPost);
router.get('/author/:userId', postController.getPostsByAuthor);

// All routes below require authentication
router.use(authenticate);

// Private routes (authenticated users)
router.post('/', postController.createPost);
router.get('/user/drafts', postController.getDrafts);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

export default router;
