const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['running', 'walking', 'cycling', 'swimming', 'weightlifting', 'yoga', 'other']
  },
  duration: {
    type: Number,  // in minutes
    required: true
  },
  distance: {
    type: Number,  // in kilometers
    default: 0
  },
  calories: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String,
  // For weightlifting
  sets: [{
    weight: Number,
    reps: Number,
    exercise: String
  }],
  // For cardio activities
  pace: Number,  // minutes per kilometer
  heartRate: {
    average: Number,
    max: Number
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['comment', 'encouragement', 'advice'],
      default: 'comment'
    },
    createdAt: {
      type: Date,
      default: Date.now  // Add this
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'celebrate', 'support'],
      required: true
    }
  }],
  isShared: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'partners', 'private'],
    default: 'friends'
  }
}, { timestamps: true });

// Add index for better query performance
ActivitySchema.index({ user: 1, date: -1 });
ActivitySchema.index({ user: 1, isShared: 1, date: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);