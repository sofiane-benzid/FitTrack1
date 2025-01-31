const { ChatRoom } = require('../models/Social');
const { createNotification } = require('./notificationController');

exports.createChat = async (req, res) => {
    try {
        const { participants, type, name } = req.body;

        // Ensure requester is included in participants
        if (!participants.includes(req.userId)) {
            participants.push(req.userId);
        }

        const chat = new ChatRoom({
            type,
            participants,
            name: type === 'group' ? name : undefined
        });

        await chat.save();

        // Notify other participants
        const otherParticipants = participants.filter(p => p !== req.userId);
        await Promise.all(otherParticipants.map(participantId =>
            createNotification({
                recipient: participantId,
                type: 'chat_created',
                message: `You've been added to a ${type} chat${name ? `: ${name}` : ''}`,
                relatedChat: chat._id
            })
        ));

        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getChats = async (req, res) => {
    try {
        const chats = await ChatRoom.find({
            participants: req.userId
        })
            .populate('participants', 'email profile.fullName')
            .select('-messages')
            .sort({ lastMessage: -1 });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const chat = await ChatRoom.findOne({
            _id: chatId,
            participants: req.userId
        })
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    select: 'email profile.fullName'
                },
                options: {
                    sort: { createdAt: -1 },
                    skip: (page - 1) * limit,
                    limit: parseInt(limit)
                }
            });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.json(chat.messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content, messageType = 'text', relatedActivity } = req.body;

        const chat = await ChatRoom.findOne({
            _id: chatId,
            participants: req.userId
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const message = {
            sender: req.userId,
            content,
            messageType,
            relatedActivity,
            readBy: [{ user: req.userId, readAt: new Date() }]
        };

        chat.messages.push(message);
        chat.lastMessage = new Date();
        await chat.save();

        // Notify other participants
        const otherParticipants = chat.participants.filter(
            p => p.toString() !== req.userId.toString()
        );

        await Promise.all(otherParticipants.map(participantId =>
            createNotification({
                recipient: participantId,
                type: 'new_message',
                message: `New message in ${chat.name || 'chat'}`,
                relatedChat: chat._id
            })
        ));

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;

        const chat = await ChatRoom.findOne({
            _id: chatId,
            participants: req.userId
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Mark unread messages as read
        chat.messages.forEach(message => {
            if (!message.readBy.some(read => read.user.toString() === req.userId.toString())) {
                message.readBy.push({
                    user: req.userId,
                    readAt: new Date()
                });
            }
        });

        await chat.save();
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};