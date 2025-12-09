import express from 'express';

const router = express.Router();

// TODO: Implement file upload functionality
router.get('/', (req, res) => {
  res.json({ message: 'Binary/file routes - TODO' });
});

export default router;
