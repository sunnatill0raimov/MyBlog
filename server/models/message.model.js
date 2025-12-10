import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, trim: true },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }, // We might need a Chat model if we want group chats or structured conversations
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Direct message support
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
