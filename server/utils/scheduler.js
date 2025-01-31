const { WorkoutPartnership } = require('../models/Social');
const { createNotification } = require('../controllers/notificationController');

const scheduleWorkoutReminders = async () => {
    try {
        const now = new Date();
        const partnerships = await WorkoutPartnership.find({
            status: 'active',
            'reminderPreferences.enabled': true
        });

        for (const partnership of partnerships) {
            const { reminderPreferences } = partnership;

            if (shouldSendReminder(reminderPreferences, now)) {
                // Send reminders to both partners
                for (const partnerId of partnership.partners) {
                    await createNotification({
                        recipient: partnerId,
                        type: 'workout_reminder',
                        message: 'Time for your workout with your partner!',
                        relatedPartnership: partnership._id
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error in workout reminder scheduler:', error);
    }
};

const shouldSendReminder = (preferences, currentTime) => {
    const { frequency, customDays, time } = preferences;
    const [scheduledHour, scheduledMinute] = time.split(':');
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // Check if it's time to send reminder
    if (currentHour !== parseInt(scheduledHour) ||
        currentMinute !== parseInt(scheduledMinute)) {
        return false;
    }

    switch (frequency) {
        case 'daily':
            return true;
        case 'weekly':
            return customDays.includes(
                currentTime.toLocaleLowerCase('en-US', { weekday: 'long' })
            );
        case 'custom':
            // Add custom scheduling logic here
            return false;
        default:
            return false;
    }
};

module.exports = { scheduleWorkoutReminders };