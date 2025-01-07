const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Meal logging routes
router.post('/meals', nutritionController.logMeal);
router.get('/meals', nutritionController.getMeals);
router.get('/summary', nutritionController.getNutritionSummary);
router.put('/meals/:id', nutritionController.updateMeal);
router.delete('/meals/:id', nutritionController.deleteMeal);
router.get('/goals', nutritionController.getNutritionGoals);
router.put('/goals', nutritionController.updateNutritionGoals);

module.exports = router;