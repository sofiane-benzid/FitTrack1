const Activity = require('../models/Activity');
const gamificationController = require('./gamificationController');

exports.logActivity = async (req, res) => {
    try {
        const activity = new Activity({
            user: req.userId,
            ...req.body
        });

        await activity.save();

        await gamificationController.checkAchievements(req.userId);
        await gamificationController.handleActivity(req.userId, 'workout_complete');
        
        res.status(201).json({
            message: 'Activity logged successfully',
            activity
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to log activity',
            error: error.message
        });
    }
};

exports.getActivities = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        let query = { user: req.userId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (type) {
            query.type = type;
        }

        const activities = await Activity.find(query).sort({ date: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch activities',
            error: error.message
        });
    }
};

exports.getActivitySummary = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activities = await Activity.find({
            user: req.userId,
            date: { $gte: thirtyDaysAgo }
        });

        const summary = {
            totalActivities: activities.length,
            totalDuration: activities.reduce((sum, act) => sum + act.duration, 0),
            totalCalories: activities.reduce((sum, act) => sum + (act.calories || 0), 0),
            byType: {}
        };

        activities.forEach(activity => {
            if (!summary.byType[activity.type]) {
                summary.byType[activity.type] = {
                    count: 0,
                    totalDuration: 0,
                    totalCalories: 0
                };
            }
            summary.byType[activity.type].count++;
            summary.byType[activity.type].totalDuration += activity.duration;
            summary.byType[activity.type].totalCalories += activity.calories || 0;
        });

        res.json(summary);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch activity summary',
            error: error.message
        });
    }
};