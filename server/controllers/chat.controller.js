import Chat from '../models/chat.model.js';
import User from '../models/user.model.js';

class ChatController {
    // @desc    Access or create a one-on-one chat
    // @route   POST /api/chat
    // @access  Protected
    async accessChat(req, res, next) {
        try {
            const { userId } = req.body;

            if (!userId) {
                const error = new Error('UserId param not sent with request');
                error.statusCode = 400;
                throw error;
            }

            var isChat = await Chat.find({
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: req.user._id } } },
                    { users: { $elemMatch: { $eq: userId } } },
                ],
            })
                .populate('users', '-password')
                .populate('latestMessage');

            isChat = await User.populate(isChat, {
                path: 'latestMessage.sender',
                select: 'username avatar email',
            });

            if (isChat.length > 0) {
                res.send(isChat[0]);
            } else {
                var chatData = {
                    chatName: 'sender',
                    isGroupChat: false,
                    users: [req.user._id, userId],
                };

                try {
                    const createdChat = await Chat.create(chatData);
                    const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                        'users',
                        '-password'
                    );
                    res.status(200).json(FullChat);
                } catch (error) {
                    next(error);
                }
            }
        } catch (error) {
            next(error);
        }
    }

    // @desc    Fetch all chats for a user
    // @route   GET /api/chat
    // @access  Protected
    async fetchChats(req, res, next) {
        try {
            Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
                .populate('users', '-password')
                .populate('groupAdmin', '-password')
                .populate('latestMessage')
                .sort({ updatedAt: -1 })
                .then(async (results) => {
                    results = await User.populate(results, {
                        path: 'latestMessage.sender',
                        select: 'username avatar email',
                    });
                    res.status(200).send(results);
                });
        } catch (error) {
            next(error);
        }
    }

    // @desc    Create New Group Chat
    // @route   POST /api/chat/group
    // @access  Protected
    async createGroupChat(req, res, next) {
        try {
            if (!req.body.name) {
                return res.status(400).send({ message: 'Please provide a group name' });
            }

            // Parse users array - can be empty (only creator)
            var users = [];
            if (req.body.users) {
                try {
                    users = JSON.parse(req.body.users);
                } catch (e) {
                    users = [];
                }
            }

            // Add creator to users
            users.push(req.user);

            const groupChat = await Chat.create({
                chatName: req.body.name,
                users: users,
                isGroupChat: true,
                groupAdmin: req.user,
            });

            const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
                .populate('users', '-password')
                .populate('groupAdmin', '-password');

            res.status(200).json(fullGroupChat);
        } catch (error) {
            next(error);
        }
    }

    // @desc    Search for public group chats
    // @route   GET /api/chat/search?search=keyword
    // @access  Protected
    async searchGroups(req, res, next) {
        try {
            const keyword = req.query.search
                ? { chatName: { $regex: req.query.search, $options: 'i' } }
                : {};

            // Find group chats that match the search and user is NOT already a member
            const groups = await Chat.find({
                ...keyword,
                isGroupChat: true,
                users: { $not: { $elemMatch: { $eq: req.user._id } } }
            })
                .populate('users', '_id')
                .populate('groupAdmin', 'username')
                .select('chatName users groupAdmin')
                .limit(10);

            res.status(200).json(groups);
        } catch (error) {
            next(error);
        }
    }

    // @desc    Join a group chat (self-join)
    // @route   PUT /api/chat/groupjoin
    // @access  Protected
    async joinGroup(req, res, next) {
        try {
            const { chatId } = req.body;

            if (!chatId) {
                return res.status(400).send({ message: 'Chat ID is required' });
            }

            // Check if chat exists and is a group
            const chat = await Chat.findById(chatId);
            if (!chat) {
                return res.status(404).send({ message: 'Group not found' });
            }
            if (!chat.isGroupChat) {
                return res.status(400).send({ message: 'This is not a group chat' });
            }

            // Check if user is already a member
            if (chat.users.includes(req.user._id)) {
                return res.status(400).send({ message: 'You are already a member of this group' });
            }

            // Add user to the group
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                { $push: { users: req.user._id } },
                { new: true }
            )
                .populate('users', '-password')
                .populate('groupAdmin', '-password');

            res.status(200).json(updatedChat);
        } catch (error) {
            next(error);
        }
    }

    // @desc    Rename Group
    // @route   PUT /api/chat/rename
    // @access  Protected
    async renameGroup(req, res, next) {
        try {
            const { chatId, chatName } = req.body;

            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    chatName: chatName,
                },
                {
                    new: true,
                }
            )
                .populate('users', '-password')
                .populate('groupAdmin', '-password');

            if (!updatedChat) {
                const error = new Error('Chat Not Found');
                error.statusCode = 404;
                throw error;
            } else {
                res.json(updatedChat);
            }
        } catch (error) {
            next(error);
        }
    }

    // @desc    Add user to Group
    // @route   PUT /api/chat/groupadd
    // @access  Protected
    async addToGroup(req, res, next) {
        try {
            const { chatId, userId } = req.body;

            // check if the requester is admin?

            const added = await Chat.findByIdAndUpdate(
                chatId,
                {
                    $push: { users: userId },
                },
                {
                    new: true,
                }
            )
                .populate('users', '-password')
                .populate('groupAdmin', '-password');

            if (!added) {
                const error = new Error('Chat Not Found');
                error.statusCode = 404;
                throw error;
            } else {
                res.json(added);
            }
        } catch (error) {
            next(error);
        }
    }

    // @desc    Remove user from Group
    // @route   PUT /api/chat/groupremove
    // @access  Protected
    async removeFromGroup(req, res, next) {
        try {
            const { chatId, userId } = req.body;

            // check if the requester is admin?

            const removed = await Chat.findByIdAndUpdate(
                chatId,
                {
                    $pull: { users: userId },
                },
                {
                    new: true,
                }
            )
                .populate('users', '-password')
                .populate('groupAdmin', '-password');

            if (!removed) {
                const error = new Error('Chat Not Found');
                error.statusCode = 404;
                throw error;
            } else {
                res.json(removed);
            }
        } catch (error) {
            next(error);
        }
    }
}

export default new ChatController();
