const mongoose = require('mongoose');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { Badge, Points } = require('../models/Gamification');

exports.getFullProfile = async (req, res) => {
  try {
    // Get user with profile and fitness data
    const user = await User.findById(req.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent activities (last 10)
    const recentActivities = await Activity.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    // Get user's badges
    const badges = await Badge.find({ user: req.userId })
      .sort({ earnedAt: -1 })
      .lean();

    // Get user's points
    const points = await Points.findOne({ user: req.userId })
      .lean();

    // Get activity statistics
    const activityStats = await Activity.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
      { 
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalMinutes: { $sum: "$duration" },
          totalCalories: { $sum: "$calories" }
        }
      }
    ]);

    // Calculate workout streak
    const workoutDates = await Activity.find({ 
      user: req.userId,
      date: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
    })
    .distinct('date')
    .sort({ date: -1 });

    let workoutStreak = 0;
    let currentDate = new Date();

    for (let date of workoutDates) {
      const dayDiff = Math.floor((currentDate - date) / (24 * 60 * 60 * 1000));
      if (dayDiff <= 1) {
        workoutStreak++;
        currentDate = date;
      } else {
        break;
      }
    }

    // Compile full profile response
    const fullProfile = {
      ...user,
      stats: {
        totalWorkouts: activityStats[0]?.totalWorkouts || 0,
        totalMinutes: activityStats[0]?.totalMinutes || 0,
        totalCalories: activityStats[0]?.totalCalories || 0,
        workoutStreak,
        points: points?.total || 0
      },
      badges,
      recentActivities,
      achievements: badges // Currently same as badges, could be expanded
    };

    res.json(fullProfile);
  } catch (error) {
    console.error('Error fetching full profile:', error);
    res.status(500).json({ 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
};