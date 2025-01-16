const mongoose = require('mongoose');

const StreakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    bestStreak: {
        type: Number,
        default: 0
    },
    lastActivityDate: Date,
    streakHistory: [{
        date: Date,
        activityType: String,
        streakCount: Number
    }]
}, { timestamps: true });


const Streak = mongoose.model('Streak', StreakSchema);


module.exports = { Streak };  // Export the model