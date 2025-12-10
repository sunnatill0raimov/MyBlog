import logger from '../utils/logger.js';

export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        socket.on('setup', (userData) => {
            if (!userData) return;
            const userId = userData._id || userData.id;
            socket.join(userId);
            socket.emit('connected');
            logger.info(`User setup: ${userData.username} (${userId})`);
        });

        socket.on('join chat', (room) => {
            socket.join(room);
            logger.info(`User joined room: ${room}`);
        });

        // Typing events - broadcast to room with room ID
        socket.on('typing', (room) => {
            socket.in(room).emit('typing', room);
        });

        socket.on('stop typing', (room) => {
            socket.in(room).emit('stop typing', room);
        });

        socket.on('new message', (newMessageReceived) => {
            var chat = newMessageReceived.chat;

            if (!chat || !chat.users) {
                return logger.warn('chat.users not defined');
            }

            // Broadcast to all users in the chat room
            socket.to(chat._id).emit('message received', newMessageReceived);

            // Also emit to individual user rooms (for notifications when not in chat)
            chat.users.forEach((user) => {
                const recipientId = user._id || user;
                const senderId = newMessageReceived.sender?._id || newMessageReceived.sender;

                if (recipientId == senderId) return;

                socket.in(recipientId).emit('message received', newMessageReceived);
            });
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });
};
