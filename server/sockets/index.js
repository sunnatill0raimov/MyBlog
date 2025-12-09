import { Server } from 'socket.io';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    // Basic configuration - you might want to add more security options
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Basic connection handling - your chat logic would go here
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });

    // Example event handler for future chat functionality
    socket.on('join_chat', (roomId) => {
      socket.join(roomId);
      logger.info(`User ${socket.id} joined chat room: ${roomId}`);
    });

    socket.on('leave_chat', (roomId) => {
      socket.leave(roomId);
      logger.info(`User ${socket.id} left chat room: ${roomId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default io;
