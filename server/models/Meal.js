const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  }
});

const MealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  foods: [FoodSchema],
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String
}, { timestamps: true });

// Calculate totals before saving
MealSchema.pre('save', function(next) {
  try {
    if (this.foods && this.foods.length > 0) {
      this.totalCalories = this.foods.reduce((sum, food) => sum + (food.calories || 0), 0);
      this.totalProtein = this.foods.reduce((sum, food) => sum + (food.protein || 0), 0);
      this.totalCarbs = this.foods.reduce((sum, food) => sum + (food.carbs || 0), 0);
      this.totalFat = this.foods.reduce((sum, food) => sum + (food.fat || 0), 0);
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Meal', MealSchema);