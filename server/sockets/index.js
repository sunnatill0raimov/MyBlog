import { Server } from 'socket.io';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import { socketHandler } from './chat.socket.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    // Basic configuration - you might want to add more security options
  });

  socketHandler(io);

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default io;
