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


exports.addComment = async (req, res) => {
    try {
        const { activityId } = req.params;
        const { content, type = 'comment' } = req.body;

        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        activity.comments.push({
            user: req.userId,
            content,
            type
        });

        await activity.save();

        // Notify activity owner if it's not their own comment
        if (activity.user.toString() !== req.userId) {
            await createNotification({
                recipient: activity.user,
                type: 'activity_comment',
                message: 'Someone commented on your activity',
                relatedActivity: activity._id
            });
        }

        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addReaction = async (req, res) => {
    try {
        const { activityId } = req.params;
        const { type } = req.body;

        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Remove existing reaction by this user if any
        activity.reactions = activity.reactions.filter(
            reaction => reaction.user.toString() !== req.userId
        );

        // Add new reaction
        activity.reactions.push({
            user: req.userId,
            type
        });

        await activity.save();

        // Notify activity owner if it's not their own reaction
        if (activity.user.toString() !== req.userId) {
            await createNotification({
                recipient: activity.user,
                type: 'activity_reaction',
                message: 'Someone reacted to your activity',
                relatedActivity: activity._id
            });
        }

        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};