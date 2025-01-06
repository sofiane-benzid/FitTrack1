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
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);