import express from 'express';
import { encodeText, decodeBinary, aiBinaryChat } from '../controllers/binary.controller.js';

const router = express.Router();

// Binary encoding and decoding routes
router.post('/encode', encodeText);
router.post('/decode', decodeBinary);

// AI Binary Chat route
router.post('/ai-chat', aiBinaryChat);

// Health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Binary API is running',
    endpoints: [
      { method: 'POST', path: '/encode', description: 'Convert text to binary' },
      { method: 'POST', path: '/decode', description: 'Convert binary to text' },
      { method: 'POST', path: '/ai-chat', description: 'AI chat using binary format' }
    ]
  });
});

export default router;
