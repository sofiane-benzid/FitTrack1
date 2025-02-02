const { ChatRoom } = require('../models/Social');
const { createNotification } = require('./notificationController');
const mongoose = require('mongoose');

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

        const chat = await ChatRoom.findOne({
            _id: chatId,
            participants: new mongoose.Types.ObjectId(req.userId)
        })
        .populate('messages.sender', 'email profile.fullName')
        .select('messages')
        .sort({ 'messages.createdAt': -1 });

        if (!chat) {
            return res.status(404).json({
                message: 'Chat room not found'
            });
        }

        // Format messages for frontend
        const messages = chat.messages.map(msg => ({
            _id: msg._id,
            content: msg.content,
            sender: msg.sender._id,
            senderName: msg.sender.profile?.fullName || msg.sender.email,
            createdAt: msg.createdAt,
            readBy: msg.readBy
        }));

        res.json(messages);

    } catch (error) {
        console.error('Error in getChatMessages:', error);
        res.status(500).json({
            message: 'Failed to fetch messages',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content, recipientId } = req.body;

        // Validate content
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                message: 'Message content cannot be empty'
            });
        }

        // Find chat with both users - using new keyword for ObjectId
        const chat = await ChatRoom.findOne({
            _id: chatId,
            participants: { 
                $all: [
                    new mongoose.Types.ObjectId(req.userId),
                    new mongoose.Types.ObjectId(recipientId)
                ] 
            }
        });

        if (!chat) {
            return res.status(404).json({
                message: 'Chat room not found'
            });
        }

        // Add new message
        const newMessage = {
            sender: new mongoose.Types.ObjectId(req.userId),
            content,
            readBy: [{
                user: new mongoose.Types.ObjectId(req.userId),
                readAt: new Date()
            }]
        };

        chat.messages.push(newMessage);
        chat.lastMessage = new Date();
        await chat.save();

        try {
            // Send notification
            await createNotification({
                recipient: recipientId,
                type: 'chat_message',
                message: 'You have a new message',
                relatedChat: chatId,
                relatedUser: req.userId
            });
        } catch (notifError) {
            console.error('Failed to send notification:', notifError);
            // Continue execution even if notification fails
        }

        // Return the new message
        res.status(201).json({
            _id: chat.messages[chat.messages.length - 1]._id,
            content: newMessage.content,
            sender: newMessage.sender,
            createdAt: new Date(),
            readBy: newMessage.readBy
        });

    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({
            message: 'Failed to send message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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