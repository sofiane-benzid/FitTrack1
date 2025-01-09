const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { Badge } = require('../models/Gamification');
const Activity = require('../models/Activity');


// Helper function to validate fitness goals
const validateFitnessGoals = (goals) => {
  const validGoals = ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'];
  return goals.every(goal => validGoals.includes(goal));
};

// Helper function to validate activity preferences
const validateActivities = (activities) => {
  const validActivities = ['running', 'walking', 'cycling', 'swimming', 'weightlifting', 'yoga', 'other'];
  return activities.every(activity => validActivities.includes(activity));
};

exports.register = async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create initial fitness data structure
    const initialFitness = {
      weeklyGoal: {
        workouts: 3,  // Default to 3 workouts per week
        minutes: 150  // WHO recommended weekly activity
      },
      statistics: {
        totalWorkouts: 0,
        totalMinutes: 0,
        totalCalories: 0,
        workoutStreak: 0
      }
    };

    // Create new user
    const user = new User({
      email,
      password,
      profile: profile || {},
      fitness: initialFitness
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select('-password')  // Exclude password from response
      .lean();  // Convert to plain JavaScript object

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password using the instance method
    const userDoc = await User.findOne({ email });
    const isMatch = await userDoc.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
      profile: user.profile,
      fitness: user.fitness
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

// Get current user's profile
exports.getMe = async (req, res) => {
  try {
    // Get user with profile and fitness data
    const user = await User.findById(req.userId)
      .select('-password')
      .populate({
        path: 'activities',
        options: { 
          sort: { date: -1 },
          limit: 10
        }
      })
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's achievements/badges
    const badges = await Badge.find({ user: req.userId })
      .sort({ earnedAt: -1 })
      .lean();

    // Add badges to user object
    const userWithExtras = {
      ...user,
      achievements: badges,
      // Make sure all required stats exist
      fitness: {
        ...user.fitness,
        statistics: {
          totalWorkouts: user.fitness?.statistics?.totalWorkouts || 0,
          totalMinutes: user.fitness?.statistics?.totalMinutes || 0,
          totalCalories: user.fitness?.statistics?.totalCalories || 0,
          workoutStreak: user.fitness?.statistics?.workoutStreak || 0,
          points: user.fitness?.statistics?.points || 0
        }
      }
    };

    res.json(userWithExtras);
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { profile } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate profile data
    if (profile.age) {
      profile.age = Number(profile.age);
      if (isNaN(profile.age) || profile.age < 0 || profile.age > 120) {
        return res.status(400).json({ message: 'Invalid age value' });
      }
    }

    if (profile.weight) {
      profile.weight = Number(profile.weight);
      if (isNaN(profile.weight) || profile.weight < 0 || profile.weight > 500) {
        return res.status(400).json({ message: 'Invalid weight value' });
      }
    }

    if (profile.height) {
      profile.height = Number(profile.height);
      if (isNaN(profile.height) || profile.height < 0 || profile.height > 300) {
        return res.status(400).json({ message: 'Invalid height value' });
      }
    }

    // Update user profile
    user.profile = {
      ...user.profile,
      ...profile,
      updatedAt: new Date()
    };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      profile: user.profile
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Profile update failed', 
      error: error.message 
    });
  }
};

exports.updateFitnessGoals = async (req, res) => {
  try {
    const { weeklyWorkouts, weeklyMinutes } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update weekly goals
    if (weeklyWorkouts) {
      user.fitness.weeklyGoal.workouts = weeklyWorkouts;
    }
    if (weeklyMinutes) {
      user.fitness.weeklyGoal.minutes = weeklyMinutes;
    }

    await user.save();

    res.json({
      message: 'Fitness goals updated successfully',
      fitness: user.fitness
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update fitness goals', 
      error: error.message 
    });
  }
};

exports.getFitnessProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('profile fitness achievements')
      .populate('activities');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      profile: user.profile,
      fitness: user.fitness,
      achievements: user.achievements,
      recentActivities: user.activities.slice(-5) // Get last 5 activities
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch fitness profile', 
      error: error.message 
    });
  }
};

exports.getWeightHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      weightHistory: user.fitness.weightHistory
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch weight history', 
      error: error.message 
    });
  }
};