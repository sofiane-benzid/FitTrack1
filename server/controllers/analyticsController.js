const Analytics = require('../models/Analytics');
const Activity = require('../models/Activity');
const Meal = require('../models/Meal');

exports.getUserAnalytics = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch activities and meals
        const [activities, meals] = await Promise.all([
            Activity.find({
                user: req.userId,
                date: { $gte: thirtyDaysAgo }
            }),
            Meal.find({
                user: req.userId,
                date: { $gte: thirtyDaysAgo }
            })
        ]);

        // Calculate workout stats
        const workoutStats = {
            weeklyAvgDuration: calculateWeeklyAverage(activities, 'duration'),
            weeklyAvgCalories: calculateWeeklyAverage(activities, 'calories'),
            mostFrequentActivity: findMostFrequent(activities, 'type'),
            completionRate: calculateCompletionRate(activities)
        };

        // Calculate nutrition stats
        const nutritionStats = {
            weeklyAvgCalories: calculateWeeklyAverage(meals, 'totalCalories'),
            weeklyAvgProtein: calculateWeeklyAverage(meals, 'totalProtein'),
            weeklyAvgCarbs: calculateWeeklyAverage(meals, 'totalCarbs'),
            weeklyAvgFat: calculateWeeklyAverage(meals, 'totalFat'),
            mealCompletionRate: calculateMealCompletionRate(meals)
        };

        // Generate recommendations
        const recommendations = generateRecommendations(workoutStats, nutritionStats);

        // Save analytics
        let analytics = await Analytics.findOne({ user: req.userId });
        if (!analytics) {
            analytics = new Analytics({
                user: req.userId
            });
        }

        analytics.workoutStats = workoutStats;
        analytics.nutritionStats = nutritionStats;
        analytics.recommendations = recommendations;

        await analytics.save();

        res.json({
            workoutStats,
            nutritionStats,
            recommendations
        });
    } catch (error) {
        console.error('Error in getUserAnalytics:', error);
        res.status(500).json({
            message: 'Failed to generate analytics',
            error: error.message
        });
    }
};

// Helper functions
const calculateWeeklyAverage = (data, field) => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, item) => sum + (item[field] || 0), 0);
    const weeks = Math.ceil(data.length / 7);
    return total / weeks;
};

const findMostFrequent = (data, field) => {
    if (data.length === 0) return null;

    const frequency = data.reduce((acc, item) => {
        acc[item[field]] = (acc[item[field]] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)[0][0];
};

const calculateCompletionRate = (activities) => {
    if (activities.length === 0) return 0;

    const days = new Set(activities.map(a =>
        new Date(a.date).toLocaleDateString()
    )).size;

    return (days / 30) * 100; // Based on 30-day period
};

const calculateMealCompletionRate = (meals) => {
    if (meals.length === 0) return 0;

    const days = new Set(meals.map(m =>
        new Date(m.date).toLocaleDateString()
    )).size;

    return (days / 30) * 100; // Based on 30-day period
};

const generateRecommendations = (workoutStats, nutritionStats) => {
    const recommendations = [];

    // Workout recommendations
    if (workoutStats.weeklyAvgDuration < 150) { // Less than WHO recommended 150 minutes/week
        recommendations.push({
            type: 'workout',
            message: 'Try to increase your weekly workout duration to at least 150 minutes',
            priority: 'high',
            category: 'workout'
        });
    }

    if (workoutStats.completionRate < 50) {
        recommendations.push({
            type: 'workout',
            message: 'Aim for more consistent workout schedule to improve results',
            priority: 'medium',
            category: 'workout'
        });
    }

    // Nutrition recommendations
    if (nutritionStats.weeklyAvgProtein < 50) { // Example threshold
        recommendations.push({
            type: 'nutrition',
            message: 'Consider increasing your protein intake for better recovery',
            priority: 'medium',
            category: 'nutrition'
        });
    }

    if (nutritionStats.mealCompletionRate < 70) {
        recommendations.push({
            type: 'nutrition',
            message: 'Try to log your meals more consistently for better tracking',
            priority: 'low',
            category: 'nutrition'
        });
    }

    return recommendations;
};