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
            'challenge_completed',
            'achievement_unlocked',
            'level_up',
            'partnership_request',
            'partnership_accepted',
            'chat_message',
            'partnership_goal_added',
            'partnership_declined',
            'activity_shared',
            'activity_comment',
            'activity_reaction',
            'workout_reminder'
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
    },
    relatedPartnership: {  // Add this
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutPartnership'
    }
}, { timestamps: true });

// Add TTL index to automatically delete old notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', NotificationSchema);