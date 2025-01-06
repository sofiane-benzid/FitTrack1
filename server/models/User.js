const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    fullName: String,
    age: Number,
    weight: Number,  // in kg
    height: Number,  // in cm
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    fitnessGoals: [{
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness']
    }],
    activityPreferences: [{
      type: String,
      enum: ['running', 'walking', 'cycling', 'swimming', 'weightlifting', 'yoga', 'other']
    }]
  },
  fitness: {
    weeklyGoal: {
      workouts: { type: Number, default: 3 },
      minutes: { type: Number, default: 150 }  // WHO recommended weekly activity
    },
    statistics: {
      totalWorkouts: { type: Number, default: 0 },
      totalMinutes: { type: Number, default: 0 },
      totalCalories: { type: Number, default: 0 },
      workoutStreak: { type: Number, default: 0 },
      lastWorkout: Date
    },
    weightHistory: [{
      weight: Number,
      date: { type: Date, default: Date.now }
    }]
  },
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  achievements: [{
    name: String,
    description: String,
    dateEarned: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['workout_streak', 'distance_milestone', 'weight_goal', 'participation']
    }
  }]
}, { timestamps: true });

// Middleware to hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to verify password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update fitness statistics
UserSchema.methods.updateFitnessStats = async function(activity) {
  this.fitness.statistics.totalWorkouts += 1;
  this.fitness.statistics.totalMinutes += activity.duration;
  this.fitness.statistics.totalCalories += activity.calories || 0;
  this.fitness.statistics.lastWorkout = activity.date;

  // Update workout streak
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const lastWorkout = this.fitness.statistics.lastWorkout;
  
  if (lastWorkout && (new Date() - lastWorkout) <= oneDayInMs) {
    this.fitness.statistics.workoutStreak += 1;
  } else {
    this.fitness.statistics.workoutStreak = 1;
  }

  await this.save();
};

// Method to add weight record
UserSchema.methods.updateWeight = async function(newWeight) {
  this.profile.weight = newWeight;
  this.fitness.weightHistory.push({
    weight: newWeight,
    date: new Date()
  });
  
  await this.save();
};

// Method to check and award achievements
UserSchema.methods.checkAchievements = async function() {
  const stats = this.fitness.statistics;
  const newAchievements = [];

  // Workout streak achievements
  if (stats.workoutStreak === 7) {
    newAchievements.push({
      name: 'Week Warrior',
      description: 'Completed workouts 7 days in a row',
      type: 'workout_streak'
    });
  }

  // Workout count achievements
  if (stats.totalWorkouts === 10) {
    newAchievements.push({
      name: 'Getting Started',
      description: 'Completed 10 workouts',
      type: 'participation'
    });
  }

  if (newAchievements.length > 0) {
    this.achievements.push(...newAchievements);
    await this.save();
  }

  return newAchievements;
};

module.exports = mongoose.model('User', UserSchema);