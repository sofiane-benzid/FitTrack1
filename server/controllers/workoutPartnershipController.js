const { WorkoutPartnership, ChatRoom } = require('../models/Social');
const { createNotification } = require('./notificationController');
const mongoose = require('mongoose');

exports.createPartnership = async (req, res) => {
    try {
        const { partnerId, reminderPreferences } = req.body;

        // Check if partnership already exists
        const existingPartnership = await WorkoutPartnership.findOne({
            partners: { 
                $all: [req.userId, partnerId] 
            },
            status: 'active'
        });

        if (existingPartnership) {
            return res.status(400).json({
                message: 'Partnership already exists with this user'
            });
        }

        // Create chat room
        const chatRoom = await ChatRoom.create({
            type: 'workout_partners',
            participants: [req.userId, partnerId],
            messages: [],
            name: `Workout Partnership Chat`
        });

        // Create partnership
        const partnership = await WorkoutPartnership.create({
            partners: [req.userId, partnerId],
            status: 'active',
            sharedGoals: [],
            reminderPreferences: reminderPreferences || {
                enabled: true,
                frequency: 'daily',
                time: '09:00'
            },
            chatRoom: chatRoom._id
        });

        try {
            // Notify the partner
            await createNotification({
                recipient: partnerId,
                type: 'friend_request', // Use an existing type temporarily
                message: 'You have received a new workout partnership request',
                relatedUser: req.userId,
                relatedPartnership: partnership._id
            });
        } catch (notificationError) {
            console.warn('Failed to send notification:', notificationError);
            // Continue execution even if notification fails
        }

        // Return populated partnership
        const populatedPartnership = await WorkoutPartnership.findById(partnership._id)
            .populate('partners', 'email profile.fullName')
            .populate('chatRoom');

        res.status(201).json({
            message: 'Partnership created successfully',
            partnership: populatedPartnership
        });

    } catch (error) {
        console.error('Partnership creation error:', error);
        res.status(500).json({
            message: 'Failed to create partnership',
            error: error.message
        });
    }
};

exports.getPartnerships = async (req, res) => {
    try {
        const partnerships = await WorkoutPartnership.find({
            partners: req.userId,
            status: 'active'
        })
            .populate('partners', 'email profile.fullName')
            .populate('chatRoom');

        res.json(partnerships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPartnership = async (req, res) => {
    try {
        const { partnerId } = req.params;

        // Find partnership with both users
        const partnership = await WorkoutPartnership.findOne({
            partners: { 
                $all: [req.userId, partnerId] 
            },
            status: 'active'
        })
        .populate('partners', 'email profile.fullName')
        .populate('chatRoom');

        if (!partnership) {
            return res.status(404).json({ 
                message: 'No active partnership found with this user' 
            });
        }

        // Get shared stats
        const sharedStats = {
            workoutsTogether: partnership.workoutsTogether || 0,
            streakDays: partnership.streakDays || 0,
            completedGoals: partnership.sharedGoals.filter(g => g.completed).length,
        };

        // Add reminder information
        const reminderPreferences = partnership.reminderPreferences || {
            enabled: true,
            frequency: 'daily',
            customDays: [],
            time: '09:00'
        };

        // Format the response
        const response = {
            _id: partnership._id,
            partners: partnership.partners,
            status: partnership.status,
            sharedGoals: partnership.sharedGoals,
            reminderPreferences,
            stats: sharedStats,
            chatRoom: partnership.chatRoom,
            createdAt: partnership.createdAt
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching partnership:', error);
        res.status(500).json({
            message: 'Failed to fetch partnership details',
            error: error.message
        });
    }
};

exports.updatePartnershipGoals = async (req, res) => {
    try {
        const { partnershipId } = req.params;
        const { sharedGoals } = req.body;

        const partnership = await WorkoutPartnership.findOne({
            _id: partnershipId,
            partners: req.userId
        });

        if (!partnership) {
            return res.status(404).json({ message: 'Partnership not found' });
        }

        partnership.sharedGoals = sharedGoals;
        await partnership.save();

        // Notify the partner about goal updates
        const partner = partnership.partners.find(
            p => p.toString() !== req.userId.toString()
        );

        await createNotification({
            recipient: partner,
            type: 'goals_updated',
            message: 'Your workout partnership goals have been updated',
            relatedPartnership: partnership._id
        });

        res.json(partnership);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateReminderPreferences = async (req, res) => {
    try {
        const { partnershipId } = req.params;
        const { reminderPreferences } = req.body;

        const partnership = await WorkoutPartnership.findOne({
            _id: partnershipId,
            partners: req.userId
        });

        if (!partnership) {
            return res.status(404).json({ message: 'Partnership not found' });
        }

        partnership.reminderPreferences = reminderPreferences;
        await partnership.save();

        res.json(partnership);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.endPartnership = async (req, res) => {
    try {
        const { partnershipId } = req.params;

        const partnership = await WorkoutPartnership.findOne({
            _id: partnershipId,
            partners: req.userId
        });

        if (!partnership) {
            return res.status(404).json({ message: 'Partnership not found' });
        }

        partnership.status = 'ended';
        await partnership.save();

        // Notify the partner
        const partner = partnership.partners.find(
            p => p.toString() !== req.userId.toString()
        );

        await createNotification({
            recipient: partner,
            type: 'partnership_ended',
            message: 'Your workout partnership has been ended',
            relatedPartnership: partnership._id
        });

        res.json({ message: 'Partnership ended successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addGoal = async (req, res) => {
    try {
        const { partnershipId } = req.params;
        const { title, description, targetDate } = req.body;

        // Validate required fields
        if (!title || !targetDate) {
            return res.status(400).json({ 
                message: 'Title and target date are required' 
            });
        }

        const partnership = await WorkoutPartnership.findOne({
            _id: partnershipId,
            partners: req.userId,
            status: 'active'
        });

        if (!partnership) {
            return res.status(404).json({ 
                message: 'Partnership not found' 
            });
        }

        // Add new goal
        partnership.sharedGoals.push({
            title,
            description,
            targetDate: new Date(targetDate),
            completed: false
        });

        await partnership.save();

        // Notify partner about new goal
        const partner = partnership.partners.find(
            p => p.toString() !== req.userId.toString()
        );

        await createNotification({
            recipient: partner,
            type: 'partnership_goal_added',
            message: `A new goal has been added: ${title}`,
            relatedPartnership: partnership._id
        });

        res.status(201).json({
            message: 'Goal added successfully',
            goal: partnership.sharedGoals[partnership.sharedGoals.length - 1]
        });

    } catch (error) {
        console.error('Error adding goal:', error);
        res.status(500).json({ 
            message: 'Failed to add goal',
            error: error.message 
        });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const { partnershipId, goalId } = req.params;
        const { title, description, targetDate, completed } = req.body;

        const partnership = await WorkoutPartnership.findOne({
            _id: partnershipId,
            partners: req.userId,
            status: 'active'
        });

        if (!partnership) {
            return res.status(404).json({ 
                message: 'Partnership not found' 
            });
        }

        // Find the goal
        const goalIndex = partnership.sharedGoals.findIndex(
            g => g._id.toString() === goalId
        );

        if (goalIndex === -1) {
            return res.status(404).json({ 
                message: 'Goal not found' 
            });
        }

        // Update goal fields if provided
        const goal = partnership.sharedGoals[goalIndex];
        if (title) goal.title = title;
        if (description) goal.description = description;
        if (targetDate) goal.targetDate = new Date(targetDate);
        if (typeof completed === 'boolean') {
            const wasCompleted = goal.completed;
            goal.completed = completed;

            // If goal was just completed, notify partner
            if (!wasCompleted && completed) {
                const partner = partnership.partners.find(
                    p => p.toString() !== req.userId.toString()
                );

                await createNotification({
                    recipient: partner,
                    type: 'partnership_goal_completed',
                    message: `Goal completed: ${goal.title}`,
                    relatedPartnership: partnership._id
                });
            }
        }

        await partnership.save();

        res.json({
            message: 'Goal updated successfully',
            goal: partnership.sharedGoals[goalIndex]
        });

    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ 
            message: 'Failed to update goal',
            error: error.message 
        });
    }
};