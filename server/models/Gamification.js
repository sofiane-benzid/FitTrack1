const mongoose = require('mongoose');

const PointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  history: [{
    amount: Number,
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const StreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  lastActivity: Date,
  streakHistory: [{
    date: Date,
    activity: String
  }]
}, { timestamps: true });

const AchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  description: String,
  type: {
    type: String,
    enum: ['workout', 'nutrition', 'social', 'streak']
  },
  criteria: {
    type: { type: String }, // e.g., 'workout_count', 'streak_days'
    value: Number // threshold value to unlock
  },
  unlockedAt: Date,
  icon: String
});

const levelThresholds = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2100,   // Level 7
  2800,   // Level 8
  3600,   // Level 9
  4500    // Level 10
];

PointsSchema.methods.calculateLevel = function() {
  let level = 1;
  for (let i = 0; i < levelThresholds.length; i++) {
    if (this.totalPoints >= levelThresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};


const BadgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['workout', 'nutrition', 'social', 'challenge'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  earnedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Points = mongoose.model('Points', PointsSchema);
const Streak = mongoose.model('Streak', StreakSchema);
const Achievement = mongoose.model('Achievement', AchievementSchema);
const Badge = mongoose.model('Badge', BadgeSchema);

module.exports = { Points, Streak, Achievement, levelThresholds, Badge };