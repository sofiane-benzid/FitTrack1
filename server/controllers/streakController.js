const { Streak } = require('../models/Streak');
const gamificationController = require('./gamificationController');

exports.updateStreak = async (userId, activityType) => {
    try {
        let streak = await Streak.findOne({ userId });
        if (!streak) {
            streak = new Streak({ userId });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!streak.lastActivityDate) {
            streak.currentStreak = 1;
        } else {
            const lastActivity = new Date(streak.lastActivityDate);
            lastActivity.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
                // Consecutive day
                streak.currentStreak++;
            } else if (daysDiff > 1) {
                // Streak broken
                streak.currentStreak = 1;
            }
            // If daysDiff === 0, same day activity - don't update streak
        }

        // Update best streak if current is higher
        if (streak.currentStreak > streak.bestStreak) {
            streak.bestStreak = streak.currentStreak;
        }

        // Add to history
        streak.streakHistory.push({
            date: today,
            activityType,
            streakCount: streak.currentStreak
        });

        streak.lastActivityDate = today;
        await streak.save();

        // Award points for streak milestones
        if (streak.currentStreak % 7 === 0) {
            await gamificationController.awardPoints(userId, 'streak_milestone', streak.currentStreak * 10);
        }

        return streak;
    } catch (error) {
        console.error('Error updating streak:', error);
        throw error;
    }
};
