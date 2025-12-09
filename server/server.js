import { server, app } from './app.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';
import { initializeSocket } from './sockets/index.js';

const PORT = env.PORT;

// Initialize Socket.io
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});
