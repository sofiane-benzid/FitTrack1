const Meal = require('../models/Meal');
const User = require('../models/User');
const gamificationController = require('./gamificationController');


// Log a meal
exports.logMeal = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('User ID:', req.userId);

    // Validate required fields
    if (!req.body.name || !req.body.type || !Array.isArray(req.body.foods)) {
      return res.status(400).json({
        message: 'Missing required fields. Please provide name, type, and foods array.'
      });
    }

    // Validate meal type
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(req.body.type)) {
      return res.status(400).json({
        message: 'Invalid meal type. Must be breakfast, lunch, dinner, or snack.'
      });
    }

    // Validate foods array
    const invalidFoods = req.body.foods.filter(food => {
      const quantity = Number(food.quantity);
      const calories = Number(food.calories);
      return !food.name ||
        isNaN(quantity) ||
        !food.unit ||
        isNaN(calories);
    });

    if (invalidFoods.length > 0) {
      return res.status(400).json({
        message: 'Invalid food items found. Each food must have name, quantity, unit, and calories.'
      });
    }

    // Process the meal data
    const mealData = {
      user: req.userId,
      name: req.body.name,
      type: req.body.type,
      foods: req.body.foods.map(food => ({
        name: food.name,
        quantity: Number(food.quantity),
        unit: food.unit,
        calories: Number(food.calories),
        protein: Number(food.protein || 0),
        carbs: Number(food.carbs || 0),
        fat: Number(food.fat || 0)
      })),
      date: req.body.date ? new Date(req.body.date) : new Date(),
      notes: req.body.notes || ''
    };

    const meal = new Meal(mealData);
    ;

    await meal.save();

    await gamificationController.checkAchievements(req.userId);
    await gamificationController.handleActivity(req.userId, 'meal_logged');



    res.status(201).json({
      message: 'Meal logged successfully',
      meal
    });
  } catch (error) {
    console.error('Error in logMeal:', error);
    res.status(500).json({
      message: 'Failed to log meal: ' + error.message,
      error: error.message
    });
  }
};

// Get all meals for a user with optional date range
exports.getMeals = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let query = { user: req.userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type) {
      query.type = type;
    }

    const meals = await Meal.find(query).sort({ date: -1 });
    res.json(meals);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch meals',
      error: error.message
    });
  }
};

// Get nutrition summary for a specific date range
exports.getNutritionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      user: req.userId,
      date: {
        $gte: startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999))
      }
    };

    const meals = await Meal.find(query);

    const summary = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      mealCount: meals.length,
      byMealType: {
        breakfast: { count: 0, calories: 0 },
        lunch: { count: 0, calories: 0 },
        dinner: { count: 0, calories: 0 },
        snack: { count: 0, calories: 0 }
      }
    };

    meals.forEach(meal => {
      summary.totalCalories += meal.totalCalories;
      summary.totalProtein += meal.totalProtein;
      summary.totalCarbs += meal.totalCarbs;
      summary.totalFat += meal.totalFat;

      summary.byMealType[meal.type].count++;
      summary.byMealType[meal.type].calories += meal.totalCalories;
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch nutrition summary',
      error: error.message
    });
  }
};

// Delete a meal
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete meal',
      error: error.message
    });
  }
};

// Update a meal
exports.updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId
      },
      req.body,
      { new: true }
    );

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({
      message: 'Meal updated successfully',
      meal
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update meal',
      error: error.message
    });
  }
};


exports.getNutritionGoals = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ goals: user.nutritionGoals });
  } catch (error) {
    console.error('Error fetching nutrition goals:', error);
    res.status(500).json({ message: 'Failed to fetch nutrition goals' });
  }
};

exports.updateNutritionGoals = async (req, res) => {
  try {
    const { goals } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only update specific nutrition goal fields
    const updatedGoals = {
      calories: Number(goals.calories) || user.nutritionGoals.calories,
      protein: Number(goals.protein) || user.nutritionGoals.protein,
      carbs: Number(goals.carbs) || user.nutritionGoals.carbs,
      fat: Number(goals.fat) || user.nutritionGoals.fat,
      waterIntake: Number(goals.waterIntake) || user.nutritionGoals.waterIntake,
      mealsPerDay: Number(goals.mealsPerDay) || user.nutritionGoals.mealsPerDay
    };

    // Update only the nutritionGoals field
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: { nutritionGoals: updatedGoals } },
      { new: true }
    );

    res.json({
      message: 'Nutrition goals updated successfully',
      goals: updatedUser.nutritionGoals
    });
  } catch (error) {
    console.error('Error updating nutrition goals:', error);
    res.status(500).json({
      message: 'Failed to update nutrition goals',
      error: error.message
    });
  }
};