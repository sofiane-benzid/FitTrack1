const { Points, Streak, Achievement, levelThresholds,Badge } = require('../models/Gamification');
const Activity = require('../models/Activity');
const Meal = require('../models/Meal');
const { createNotification } = require('./notificationController');

const POINT_VALUES = {
  'challenge_progress': 5,
  'challenge_complete': 100,
  'workout_complete': 50,
  'meal_logged': 25,
  'friend_added': 30,
  'profile_complete': 40,
  'streak_milestone': 75
};

exports.getPoints = async (req, res) => {
  try {
    let points = await Points.findOne({ userId: req.userId });
    
    if (!points) {
      points = new Points({
        userId: req.userId,
        totalPoints: 0,
        level: 1,
        history: []
      });
      await points.save();
    }

    // Calculate current level and next threshold
    let currentLevel = 1;
    let nextThreshold = levelThresholds[1]; // Default to first threshold

    for (let i = 0; i < levelThresholds.length; i++) {
      if (points.totalPoints >= levelThresholds[i]) {
        currentLevel = i + 1;
        nextThreshold = levelThresholds[i + 1] || levelThresholds[i]; // Use next threshold or current if at max
      } else {
        break;
      }
    }

    // Save the calculated level if it's different
    if (points.level !== currentLevel) {
      points.level = currentLevel;
      await points.save();
    }

    res.json({
      totalPoints: points.totalPoints || 0,
      level: currentLevel,
      nextLevelThreshold: nextThreshold,
      history: points.history || []
    });
  } catch (error) {
    console.error('Points fetch error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Points.find()
      .populate({
        path: 'userId',
        select: 'email profile.fullName',
        options: { strictPopulate: false } // This helps handle missing references
      })
      .sort({ totalPoints: -1 })
      .limit(10);

    const formattedLeaderboard = leaderboard.filter(entry => entry.userId) // Filter out entries without users
      .map((entry, index) => ({
        _id: entry._id,
        userId: entry.userId._id,
        fullName: entry.userId.profile?.fullName || entry.userId.email || 'Anonymous',
        totalPoints: entry.totalPoints,
        totalActivities: entry.history.length,
        rank: index + 1
      }));

    res.json(formattedLeaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getStreak = async (req, res) => {
  try {
    let streak = await Streak.findOne({ userId: req.userId });
    
    if (!streak) {
      streak = new Streak({
        userId: req.userId,
        currentStreak: 0,
        bestStreak: 0
      });
      await streak.save();
    }

    res.json({
      currentStreak: streak.currentStreak || 0,
      bestStreak: streak.bestStreak || 0
    });
  } catch (error) {
    console.error('Streak fetch error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.awardPoints = async (userId, action, extraPoints = 0) => {
  try {
    const basePoints = POINT_VALUES[action] || 0;
    const additionalPoints = parseInt(extraPoints) || 0;
    const pointsToAward = basePoints + additionalPoints;

    let points = await Points.findOne({ userId });
    
    if (!points) {
      points = new Points({
        userId,
        totalPoints: 0,
        history: []
      });
    }

    // Update total points
    points.totalPoints = (points.totalPoints || 0) + pointsToAward;

    // Calculate new level based on total points
    let newLevel = 1;
    for (let i = 0; i < levelThresholds.length; i++) {
      if (points.totalPoints >= levelThresholds[i]) {
        newLevel = i + 1;
      } else {
        break;
      }
    }

    // If level has increased, add it to history and update level
    if (newLevel > (points.level || 1)) {
      points.level = newLevel;
      points.history.push({
        amount: 0, // No points for level up itself
        reason: `Reached Level ${newLevel}!`,
        timestamp: new Date()
      });

      // Notify user of level up
      await createNotification({
        recipient: userId,
        type: 'level_up',
        message: `Congratulations! You've reached Level ${newLevel}!`
      });
    }

    // Add points to history
    points.history.push({
      amount: pointsToAward,
      reason: action,
      timestamp: new Date()
    });

    await points.save();
    
    return points;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
};

exports.updateStreak = async (userId, activityType) => {
  try {
    let streak = await Streak.findOne({ userId });
    if (!streak) {
      streak = new Streak({ userId });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!streak.lastActivity) {
      streak.currentStreak = 1;
    } else {
      const lastActivity = new Date(streak.lastActivity);
      lastActivity.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already logged activity today
        return streak;
      } else if (diffDays === 1) {
        // Consecutive day
        streak.currentStreak += 1;
      } else {
        // Streak broken
        streak.currentStreak = 1;
      }
    }

    // Update best streak
    if (streak.currentStreak > streak.bestStreak) {
      streak.bestStreak = streak.currentStreak;
    }

    streak.lastActivity = today;
    streak.streakHistory.push({
      date: today,
      activity: activityType
    });

    // Award streak milestone points
    if (streak.currentStreak % 7 === 0) {
      await this.awardPoints(userId, 'streak_milestone', streak.currentStreak);
      await createNotification({
        recipient: userId,
        type: 'streak_milestone',
        message: `Amazing! You've maintained a ${streak.currentStreak}-day streak!`
      });
    }

    await streak.save();
    return streak;
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};

exports.checkAchievements = async (userId) => {
  try {
    // Get user stats
    const [activities, meals, streak] = await Promise.all([
      Activity.countDocuments({ user: userId }),
      Meal.countDocuments({ user: userId }),
      Streak.findOne({ userId })
    ]);

    const achievements = [
      {
        name: 'First Step',
        type: 'workout',
        criteria: { type: 'workout_count', value: 1 },
        description: 'Complete your first workout'
      },
      {
        name: 'Workout Warrior',
        type: 'workout',
        criteria: { type: 'workout_count', value: 10 },
        description: 'Complete 10 workouts'
      },
      {
        name: 'Nutrition Novice',
        type: 'nutrition',
        criteria: { type: 'meal_count', value: 10 },
        description: 'Log 10 meals'
      },
      {
        name: 'Streak Master',
        type: 'streak',
        criteria: { type: 'streak_days', value: 7 },
        description: 'Maintain a 7-day streak'
      }
    ];

    // Get existing badges
    const existingBadges = await Badge.find({ user: userId });
    const unlockedBadges = [];

    for (const achievement of achievements) {
      // Skip if already earned
      if (existingBadges.some(badge => badge.name === achievement.name)) {
        continue;
      }

      let isUnlocked = false;

      // Check if achievement criteria is met
      switch (achievement.criteria.type) {
        case 'workout_count':
          isUnlocked = activities >= achievement.criteria.value;
          break;
        case 'meal_count':
          isUnlocked = meals >= achievement.criteria.value;
          break;
        case 'streak_days':
          isUnlocked = streak?.currentStreak >= achievement.criteria.value;
          break;
      }

      if (isUnlocked) {
        // Create new badge
        const newBadge = new Badge({
          user: userId,
          type: achievement.type,
          name: achievement.name,
          description: achievement.description,
          earnedAt: new Date()
        });

        await newBadge.save();
        unlockedBadges.push(newBadge);

        // Create notification
        await createNotification({
          recipient: userId,
          type: 'achievement_unlocked',
          message: `Achievement Unlocked: ${achievement.name}!`
        });

        // Award points for achievement
        await this.awardPoints(userId, 'achievement_unlocked', 50);
      }
    }

    return unlockedBadges;
  } catch (error) {
    console.error('Error checking achievements:', error);
    throw error;
  }
};

exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.userId })
      .sort({ unlockedAt: -1 });

    res.json(achievements || []);
  } catch (error) {
    console.error('Achievements fetch error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getBadges = async (req, res) => {
  try {
    const badges = await Achievement.find({ userId: req.userId })
      .sort({ unlockedAt: -1 });
    res.json(badges);
    console.log( req.userId );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Call this when user completes an activity (workout, meal logging, etc.)
exports.handleActivity = async (userId, activityType) => {
  try {
    // Award points
    await this.awardPoints(userId, activityType);
    
    // Update streak
    const streak = await this.updateStreak(userId, activityType);
    
    // Check achievements
    const achievements = await this.checkAchievements(userId, {
      activityType,
      currentStreak: streak.currentStreak
    });

    return { streak, achievements };
  } catch (error) {
    throw error;
  }
};