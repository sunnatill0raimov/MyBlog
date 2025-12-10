import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';

class MessageController {
    // @desc    Get all Messages
    // @route   GET /api/message/:chatId
    // @access  Protected
    async allMessages(req, res, next) {
        try {
            const messages = await Message.find({ chat: req.params.chatId })
                .populate('sender', 'username avatar email')
                .populate('chat');
            res.json(messages);
        } catch (error) {
            next(error);
        }
    }

    // @desc    Create New Message
    // @route   POST /api/message
    // @access  Protected
    async sendMessage(req, res, next) {
        try {
            const { content, chatId } = req.body;

            if (!content || !chatId) {
                console.log('Invalid data passed into request');
                return res.sendStatus(400);
            }

            var newMessage = {
                sender: req.user._id,
                content: content,
                chat: chatId,
            };

            try {
                var message = await Message.create(newMessage);

                message = await message.populate('sender', 'username avatar');
                message = await message.populate('chat');
                message = await User.populate(message, {
                    path: 'chat.users',
                    select: 'username avatar email',
                });

                await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

                res.json(message);
            } catch (error) {
                next(error);
            }
        } catch (error) {
            next(error);
        }
    }
}

export default new MessageController();
