import express from 'express';

const router = express.Router();

// TODO: Implement chat functionality
router.get('/', (req, res) => {
  res.json({ message: 'Chat routes - TODO' });
});

export default router;
