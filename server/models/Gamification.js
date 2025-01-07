const mongoose = require('mongoose');

const PointsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  total: {
    type: Number,
    default: 0
  },
  history: [{
    amount: Number,
    reason: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

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

module.exports = {
  Points: mongoose.model('Points', PointsSchema),
  Badge: mongoose.model('Badge', BadgeSchema)
};