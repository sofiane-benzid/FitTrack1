const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    workoutStats: {
        weeklyAvgDuration: Number,
        weeklyAvgCalories: Number,
        mostFrequentActivity: String,
        completionRate: Number
    },
    nutritionStats: {
        weeklyAvgCalories: Number,
        weeklyAvgProtein: Number,
        weeklyAvgCarbs: Number,
        weeklyAvgFat: Number,
        mealCompletionRate: Number
    },
    recommendations: [{
        type: String,
        message: String,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high']
        },
        category: {
            type: String,
            enum: ['workout', 'nutrition']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);