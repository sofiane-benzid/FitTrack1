exports.calculateCalories = (activity) => {
    // Basic MET (Metabolic Equivalent of Task) values
    const MET = {
        running: 8,
        walking: 3.5,
        cycling: 7.5,
        swimming: 6,
        weightlifting: 3,
        yoga: 2.5,
        other: 4
    };

    // Formula: Calories = MET * weight(kg) * duration(hours)
    // Note: This is a simplified calculation
    const hours = activity.duration / 60;
    const weight = activity.userWeight || 70; // default weight if not provided
    return Math.round(MET[activity.type] * weight * hours);
};

exports.calculatePace = (distance, duration) => {
    if (!distance || !duration) return null;
    return duration / distance; // minutes per kilometer
};