import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../../../server/config/env';
import { useAuth } from '../../../hooks/useAuth';
import Feedback from '../../common/Feedback';

const NutritionGoals = () => {
  useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
    waterIntake: 2000, // ml
    mealsPerDay: 3
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/nutrition/goals`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setGoals(data.goals);
        }
      } catch (error) {
        console.error('Error fetching nutrition goals:', error);
      }
    };

    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/nutrition/goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ goals })
      });

      if (!response.ok) {
        throw new Error('Failed to update nutrition goals');
      }

      setFeedback({
        type: 'success',
        message: 'Nutrition goals updated successfully!'
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGoals(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  return (
    <div className="min-h-screen bg-black/90 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-black/60 p-8 rounded-2xl border border-blue-500/20 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Nutrition Goals</h2>

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              { name: 'calories', label: 'Daily Calorie Target', unit: 'kcal' },
              { name: 'protein', label: 'Daily Protein Target', unit: 'g' },
              { name: 'carbs', label: 'Daily Carbs Target', unit: 'g' },
              { name: 'fat', label: 'Daily Fat Target', unit: 'g' },
              { name: 'waterIntake', label: 'Daily Water Intake Target', unit: 'ml' }
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-400">
                  {field.label}
                </label>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="mt-1 relative rounded-md"
                >
                  <input
                    type="number"
                    name={field.name}
                    value={goals[field.name]}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-black/30 border-blue-500/20 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={goals[field.name].toString()}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{field.unit}</span>
                  </div>
                </motion.div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Target Meals per Day
              </label>
              <motion.select
                whileHover={{ scale: 1.02 }}
                name="mealsPerDay"
                value={goals.mealsPerDay}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-black/30 border-blue-500/20 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {[2, 3, 4, 5, 6].map(mealCount => (
                  <option
                    key={mealCount}
                    value={mealCount}
                    className="bg-black text-white"
                  >
                    {mealCount} meals
                  </option>
                ))}
              </motion.select>
            </div>
          </motion.div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`
                inline-flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white 
                ${loading
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                } 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              `}
            >
              {loading ? 'Saving...' : 'Save Goals'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NutritionGoals;