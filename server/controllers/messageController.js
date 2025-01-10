const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;

        // Verify recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const message = new Message({
            sender: req.userId,
            recipient: recipientId,
            content
        });

        await message.save();

        res.status(201).json({
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            message: 'Failed to send message',
            error: error.message
        });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.userId },
                { recipient: req.userId }
            ]
        })
            .populate('sender', 'email profile.fullName')
            .populate('recipient', 'email profile.fullName')
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const message = await Message.findOneAndUpdate(
            {
                _id: req.params.messageId,
                recipient: req.userId
            },
            { read: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to mark message as read',
            error: error.message
        });
    }
};