const { Points, Badge } = require('../models/Gamification');
const Activity = require('../models/Activity');
const User = require('../models/User');

exports.awardPoints = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    let points = await Points.findOne({ user: req.userId });
    if (!points) {
      points = new Points({ user: req.userId });
    }

    points.total += amount;
    points.history.push({ amount, reason });
    await points.save();

    res.json({
      message: 'Points awarded successfully',
      points: points.total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to award points',
      error: error.message
    });
  }
};

exports.getPoints = async (req, res) => {
  try {
    const points = await Points.findOne({ user: req.userId });
    res.json(points || { total: 0, history: [] });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get points',
      error: error.message
    });
  }
};

exports.awardBadge = async (req, res) => {
  try {
    const { type, name, description } = req.body;

    // Check if user already has this badge
    const existingBadge = await Badge.findOne({
      user: req.userId,
      type,
      name
    });

    if (existingBadge) {
      return res.status(400).json({ message: 'Badge already awarded' });
    }

    const badge = new Badge({
      user: req.userId,
      type,
      name,
      description
    });

    await badge.save();

    // Award points for badge
    let points = await Points.findOne({ user: req.userId });
    if (!points) {
      points = new Points({ user: req.userId });
    }
    points.total += 50; // Award 50 points for each badge
    points.history.push({
      amount: 50,
      reason: `Earned ${name} badge`
    });
    await points.save();

    res.status(201).json({
      message: 'Badge awarded successfully',
      badge
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to award badge',
      error: error.message
    });
  }
};

exports.getBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.userId });
    res.json(badges);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get badges',
      error: error.message
    });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    // Get all users' points
    const pointsData = await Points.find()
      .populate('user', 'email profile.fullName')
      .lean();

    // Get activity counts for each user
    const activityCounts = await Activity.aggregate([
      {
        $group: {
          _id: '$user',
          totalActivities: { $sum: 1 }
        }
      }
    ]);

    // Create a map of user activity counts
    const activityMap = activityCounts.reduce((map, item) => {
      map[item._id.toString()] = item.totalActivities;
      return map;
    }, {});

    // Process and sort leaderboard data
    const leaderboard = pointsData
      .map((entry, index) => ({
        rank: index + 1,
        user: {
          id: entry.user._id,
          name: entry.user.profile?.fullName || entry.user.email,
          email: entry.user.email
        },
        points: entry.total || 0,
        totalActivities: activityMap[entry.user._id.toString()] || 0
      }))
      .sort((a, b) => b.points - a.points)
      // Add rank after sorting
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    res.status(500).json({
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
};