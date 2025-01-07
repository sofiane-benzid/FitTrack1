const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'friend_request',
            'friend_accepted',
            'friend_declined',
            'friend_removed',
            'challenge_invite',
            'challenge_completed'
        ],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    relatedChallenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
    }
}, { timestamps: true });

// Add TTL index to automatically delete old notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', NotificationSchema);