const Activity = require('../models/Activity');
const gamificationController = require('./gamificationController');
const { Friendship, WorkoutPartnership } = require('../models/Social');
const { createNotification } = require('./notificationController');
const mongoose = require('mongoose');

exports.logActivity = async (req, res) => {
    try {
        const activity = new Activity({
            user: req.userId,
            ...req.body
        });

        await activity.save();

        // Handle gamification
        await gamificationController.checkAchievements(req.userId);
        await gamificationController.handleActivity(req.userId, 'workout_complete');

        // If activity is shared, notify workout partner
        if (activity.isShared) {
            // Find active partnership
            const partnership = await WorkoutPartnership.findOne({
                partners: req.userId,
                status: 'active'
            });

            if (partnership) {
                // Get partner ID (the other user in the partnership)
                const partnerId = partnership.partners.find(
                    id => id.toString() !== req.userId
                );

                // Create notification for partner
                await createNotification({
                    recipient: partnerId,
                    type: 'activity_shared',
                    message: 'Your workout partner has shared a new activity',
                    relatedActivity: activity._id
                });
            }
        }

        res.status(201).json({
            message: 'Activity logged successfully',
            activity
        });
    } catch (error) {
        console.error('Error logging activity:', error);
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

exports.getActivityFeed = async (req, res) => {
    try {
        // First get user's friends
        const friendships = await Friendship.find({
            $or: [
                { requester: req.userId, status: 'accepted' },
                { recipient: req.userId, status: 'accepted' }
            ]
        });

        // Get friend IDs and ensure they're ObjectIds
        const friendIds = friendships.map(friendship => 
            friendship.requester.toString() === req.userId.toString() 
                ? friendship.recipient 
                : friendship.requester
        ).map(id => new mongoose.Types.ObjectId(id));

        // Add user's own ID to the list
        const userAndFriendIds = [new mongoose.Types.ObjectId(req.userId), ...friendIds];

        // Get activities
        const activities = await Activity.find({
            user: { $in: userAndFriendIds }
        })
        .populate({
            path: 'user',
            select: 'email profile.fullName'
        })
        .populate({
            path: 'comments.user',
            select: 'email profile.fullName'
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(); // Use lean() for better performance

        // Format the response
        const formattedActivities = activities.map(activity => ({
            ...activity,
            isOwner: activity.user._id.toString() === req.userId.toString(),
            user: {
                _id: activity.user._id,
                name: activity.user.profile?.fullName || activity.user.email,
                email: activity.user.email
            },
            comments: (activity.comments || []).map(comment => ({
                ...comment,
                user: {
                    _id: comment.user._id,
                    name: comment.user.profile?.fullName || comment.user.email,
                    email: comment.user.email
                }
            }))
        }));

        res.json(formattedActivities);

    } catch (error) {
        console.error('Error in getActivityFeed:', error);
        res.status(500).json({
            message: 'Failed to fetch activity feed',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
            type,
            createdAt: new Date()
        });

        await activity.save();

        // Get updated activity with populated fields
        const updatedActivity = await Activity.findById(activityId)
            .populate({
                path: 'comments.user',
                select: 'email profile.fullName'
            });

        // Notify activity owner if it's not their own comment
        if (activity.user.toString() !== req.userId) {
            await createNotification({
                recipient: activity.user,
                type: 'activity_comment',
                message: 'Someone commented on your activity',
                relatedActivity: activity._id
            });
        }

        // Send single response with updated activity
        return res.status(201).json({
            message: 'Comment added successfully',
            activity: updatedActivity
        });
        
    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ 
            message: 'Failed to add comment',
            error: error.message 
        });
    }
};

exports.getSharedActivities = async (req, res) => {
    try {
        const { partnerId } = req.params;

        if (!partnerId) {
            return res.status(400).json({
                message: 'Partner ID is required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({
                message: 'Invalid partner ID format'
            });
        }

        // First verify partnership exists
        const partnership = await WorkoutPartnership.findOne({
            partners: { 
                $all: [
                    new mongoose.Types.ObjectId(req.userId),
                    new mongoose.Types.ObjectId(partnerId)
                ]
            },
            status: 'active'
        });

        if (!partnership) {
            return res.status(404).json({ 
                message: 'No active partnership found with this user'
            });
        }

        // Get shared activities
        const activities = await Activity.find({
            user: { 
                $in: [
                    new mongoose.Types.ObjectId(req.userId),
                    new mongoose.Types.ObjectId(partnerId)
                ]
            },
            $or: [
                { isShared: true },
                { visibility: 'partners' }
            ],
            date: { 
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
        })
        .sort({ date: -1 })
        .select('type duration distance notes date user')
        .lean(); // Use lean() for better performance

        // Format activities for response
        const formattedActivities = activities.map(activity => ({
            _id: activity._id,
            type: activity.type,
            duration: activity.duration,
            distance: activity.distance || null,
            notes: activity.notes || null,
            date: activity.date,
            isOwnActivity: activity.user.toString() === req.userId
        }));

        res.json(formattedActivities);

    } catch (error) {
        console.error('Error in getSharedActivities:', error);
        res.status(500).json({
            message: 'Failed to fetch shared activities',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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

        // Get updated activity with populated fields
        const updatedActivity = await Activity.findById(activityId)
            .populate({
                path: 'reactions.user',
                select: 'email profile.fullName'
            });

        // Only send notification if it's not the user's own activity
        if (activity.user.toString() !== req.userId) {
            await createNotification({
                recipient: activity.user,
                type: 'activity_reaction',
                message: 'Someone reacted to your activity',
                relatedActivity: activity._id
            }).catch(err => console.error('Error sending notification:', err));
        }

        // Single response with updated activity
        return res.status(200).json({
            message: 'Reaction added successfully',
            activity: updatedActivity
        });

    } catch (error) {
        console.error('Error adding reaction:', error);
        return res.status(500).json({ 
            message: 'Failed to add reaction',
            error: error.message 
        });
    }
};