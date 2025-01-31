const { WorkoutPartnership, ChatRoom } = require('../models/Social');
const { createNotification } = require('./notificationController');

exports.createPartnership = async (req, res) => {
    try {
        const { partnerId, sharedGoals, reminderPreferences } = req.body;

        // Create a chat room for the partnership
        const chatRoom = new ChatRoom({
            type: 'workout_partners',
            participants: [req.userId, partnerId]
        });
        await chatRoom.save();

        // Create the partnership
        const partnership = new WorkoutPartnership({
            partners: [req.userId, partnerId],
            sharedGoals,
            reminderPreferences,
            chatRoom: chatRoom._id
        });
        await partnership.save();

        // Notify the partner
        await createNotification({
            recipient: partnerId,
            type: 'partnership_request',
            message: 'You have a new workout partnership request',
            relatedPartnership: partnership._id
        });

        res.status(201).json(partnership);
    } catch (error) {
        res.status(500).json({ message: error.message });
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