const Notification = require('../models/Notification');

// Helper function to create notifications
exports.createNotification = async ({ recipient, type, message, relatedUser = null, relatedChallenge = null }) => {
    try {
        const notification = new Notification({
            recipient,
            type,
            message,
            relatedUser,
            relatedChallenge
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.userId
        })
            .sort({ createdAt: -1 })
            .populate('relatedUser', 'email profile.fullName')
            .populate('relatedChallenge', 'title');

        res.json(notifications);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            message: 'Failed to get notifications',
            error: error.message
        });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: req.userId
            },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.userId },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: req.userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

exports.sendWorkoutReminder = async (partnership) => {
    const { partners } = partnership;
    for (const partnerId of partners) {
        await createNotification({
            recipient: partnerId,
            type: 'workout_reminder',
            message: 'Time for your workout with your partner!'
        });
    }
};