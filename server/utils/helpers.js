exports.isProfileComplete = (profile) => {
    const requiredFields = [
        'fullName',
        'age',
        'weight',
        'height',
        'gender',
        'fitnessLevel',
        'fitnessGoals'
    ];

    return requiredFields.every(field => {
        if (Array.isArray(profile[field])) {
            return profile[field].length > 0;
        }
        return Boolean(profile[field]);
    });
};