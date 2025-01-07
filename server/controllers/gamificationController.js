const { Points, Badge } = require('../models/Gamification');
const { User } = require('../models/User');

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
    const points = await Points.find()
      .sort({ total: -1 })
      .limit(10)
      .populate('user', 'email profile.fullName');

    const leaderboard = points.map((entry, index) => ({
      rank: index + 1,
      user: {
        id: entry.user._id,
        email: entry.user.email,
        name: entry.user.profile.fullName
      },
      points: entry.total
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
};