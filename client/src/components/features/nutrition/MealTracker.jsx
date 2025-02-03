import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Feedback from '../../common/Feedback';
import PropTypes from 'prop-types';
import { API_BASE_URL } from '../../../../../server/config/env';

const MealTracker = ({ onMealLogged }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'breakfast',
    foods: [],
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [currentFood, setCurrentFood] = useState({
    name: '',
    quantity: '',
    unit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFoodChange = (e) => {
    const { name, value } = e.target;
    setCurrentFood(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addFood = () => {
    if (!currentFood.name || !currentFood.quantity || !currentFood.calories) {
      setFeedback({
        type: 'error',
        message: 'Please fill in at least the food name, quantity, and calories'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      foods: [...prev.foods, currentFood]
    }));

    setCurrentFood({
      name: '',
      quantity: '',
      unit: 'g',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    });

    setFeedback({
      type: 'success',
      message: 'Food added to meal'
    });
  };

  const removeFood = (index) => {
    setFormData(prev => ({
      ...prev,
      foods: prev.foods.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.foods.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Please add at least one food to the meal'
      });
      return;
    }

    setLoading(true);
    try {
      const processedData = {
        ...formData,
        foods: formData.foods.map(food => ({
          ...food,
          quantity: Number(food.quantity),
          calories: Number(food.calories),
          protein: Number(food.protein || 0),
          carbs: Number(food.carbs || 0),
          fat: Number(food.fat || 0)
        }))
      };

      const response = await fetch(`${API_BASE_URL}/nutrition/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to log meal');
      }

      await response.json();

      setFeedback({
        type: 'success',
        message: 'Meal logged successfully!'
      });

      setFormData({
        name: '',
        type: 'breakfast',
        foods: [],
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });

      onMealLogged();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Failed to log meal'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/90 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-black/60 p-8 rounded-2xl border border-orange-500/20 shadow-2xl"
      >
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Feedback
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-400">Meal Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md bg-black/30 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Meal Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-black/30 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
              >
                {mealTypes.map(type => (
                  <option 
                    key={type.value} 
                    value={type.value} 
                    className="bg-black text-white"
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Food Input Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-orange-500/20 p-4 rounded-md bg-black/30"
          >
            <h3 className="text-lg font-medium text-white mb-4">Add Foods</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-400">Food Name</label>
                <input
                  type="text"
                  name="name"
                  value={currentFood.name}
                  onChange={handleFoodChange}
                  className="mt-1 block w-full rounded-md bg-black/30 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={currentFood.quantity}
                    onChange={handleFoodChange}
                    className="mt-1 block w-full rounded-md bg-black/30 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Unit</label>
                  <select
                    name="unit"
                    value={currentFood.unit}
                    onChange={handleFoodChange}
                    className="mt-1 block w-full rounded-md bg-black/30 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value="g" className="bg-black text-white">grams</option>
                    <option value="ml" className="bg-black text-white">milliliters</option>
                    <option value="oz" className="bg-black text-white">ounces</option>
                    <option value="serving" className="bg-black text-white">serving</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">Calories</label>
                <input
                  type="number"
                  name="calories"
                  value={currentFood.calories}
                  onChange={handleFoodChange}
                  className="mt-1 block w-full rounded-md bg-black/30 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['protein', 'carbs', 'fat'].map(nutrient => (
                  <div key={nutrient}>
                    <label className="block text-sm font-medium text-gray-400">
                      {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)} (g)
                    </label>
                    <input
                      type="number"
                      name={nutrient}
                      value={currentFood[nutrient]}
                      onChange={handleFoodChange}
                      className="mt-1 block w-full rounded-md bg-black/30 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={addFood}
              className="mt-4 w-full bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded hover:from-red-600 hover:to-orange-600"
            >
              Add Food
            </motion.button>
          </motion.div>

          {/* Food List */}
          <AnimatePresence>
            {formData.foods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="text-lg font-medium text-white mb-2">Added Foods</h3>
                <div className="space-y-2">
                  {formData.foods.map((food, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex justify-between items-center bg-black/30 p-3 rounded border border-orange-500/20"
                    >
                      <div>
                        <span className="font-medium text-white">{food.name}</span>
                        <span className="text-gray-400 ml-2">
                          {food.quantity}{food.unit} - {food.calories} cal
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeFood(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium text-gray-400">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-black/30 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md bg-black/30 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
            ></textarea>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white ${
              loading 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
          >
            {loading ? 'Logging Meal...' : 'Log Meal'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

MealTracker.propTypes = {
  onMealLogged: PropTypes.func.isRequired,
};

export default MealTracker;