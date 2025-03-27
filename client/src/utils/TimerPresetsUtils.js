// This utility provides predefined timer settings for different exercise types

/**
 * Gets suggested timer duration for different activity types
 * @param {string} activityType - The type of activity
 * @returns {number} - Suggested duration in minutes
 */
export const getSuggestedDuration = (activityType) => {
    const suggestions = {
        running: 30,
        walking: 45,
        cycling: 30,
        swimming: 30,
        weightlifting: 60,
        yoga: 45,
        other: 30
    };

    return suggestions[activityType] || 30;
};

/**
 * Descriptions for different exercise types
 * @param {string} activityType - The type of activity
 * @returns {string} - A description of the activity
 */
export const getActivityDescription = (activityType) => {
    const descriptions = {
        running: 'Track your running pace, distance, and calories burned in real-time.',
        walking: 'Monitor your walking distance and calories burned as you go.',
        cycling: 'Keep track of your cycling distance, speed, and calories burned.',
        swimming: 'Track your swimming session with real-time calorie and distance estimates.',
        weightlifting: 'Time your strength training session and track calories burned.',
        yoga: 'Follow along with your yoga practice with a convenient timer.',
        other: 'Keep track of your exercise duration and calories burned.'
    };

    return descriptions[activityType] || 'Track your workout in real-time.';
};

/**
 * Get motivational messages for during exercise
 * @returns {string} - A random motivational message
 */
export const getRandomMotivationalMessage = () => {
    const messages = [
        "Keep pushing! You're doing great!",
        "Stay strong, you've got this!",
        "Remember why you started!",
        "Every rep counts!",
        "Don't quit now!",
        "You're making progress with every second!",
        "Your future self thanks you for this effort!",
        "Focus on your form and breathing!",
        "You're stronger than you think!",
        "This is where champions are made!"
    ];

    return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get a completion message based on activity type
 * @param {string} activityType - The type of activity
 * @returns {string} - A completion message
 */
export const getCompletionMessage = (activityType) => {
    const messages = {
        running: "Great run! Take time to cool down and stretch.",
        walking: "Excellent walk! You've taken steps toward better health.",
        cycling: "Fantastic ride! Make sure to hydrate.",
        swimming: "Great swim! Your cardiovascular system thanks you.",
        weightlifting: "Workout complete! Your muscles will thank you tomorrow.",
        yoga: "Namaste! Your mind and body are now more balanced.",
        other: "Workout complete! You should be proud of yourself."
    };

    return messages[activityType] || "Congratulations on completing your workout!";
};

/**
 * Calculate intensity level based on duration and activity type
 * @param {number} duration - Duration in minutes
 * @param {string} activityType - Type of activity
 * @returns {string} - Intensity level description
 */
export const calculateIntensityLevel = (duration, activityType) => {
    // Define baseline thresholds for different activities (in minutes)
    const thresholds = {
        running: { light: 15, moderate: 30, intense: 45 },
        walking: { light: 30, moderate: 60, intense: 90 },
        cycling: { light: 20, moderate: 45, intense: 75 },
        swimming: { light: 15, moderate: 30, intense: 45 },
        weightlifting: { light: 30, moderate: 60, intense: 90 },
        yoga: { light: 20, moderate: 45, intense: 75 },
        other: { light: 20, moderate: 40, intense: 60 }
    };

    const activityThresholds = thresholds[activityType] || thresholds.other;

    if (duration >= activityThresholds.intense) {
        return "High Intensity";
    } else if (duration >= activityThresholds.moderate) {
        return "Moderate Intensity";
    } else if (duration >= activityThresholds.light) {
        return "Light Intensity";
    } else {
        return "Quick Session";
    }
};

/**
 * Generate a motivational icon based on activity type
 * @param {string} activityType - Type of activity
 * @returns {string} - An emoji representing the activity
 */
export const getActivityIcon = (activityType) => {
    const icons = {
        running: '🏃',
        walking: '🚶',
        cycling: '🚴',
        swimming: '🏊',
        weightlifting: '🏋️',
        yoga: '🧘',
        other: '💪'
    };

    return icons[activityType] || '💪';
};