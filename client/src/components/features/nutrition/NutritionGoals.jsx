import { useState, useEffect } from 'react';
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
    // Fetch user's nutrition goals if they exist
    const fetchGoals = async () => {
      try {
        const response = await fetch('http://localhost:5000/nutrition/goals', {
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
      const response = await fetch('http://localhost:5000/nutrition/goals', {
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
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Nutrition Goals</h2>

      {feedback && (
        <Feedback
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Daily Calorie Target
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="calories"
                value={goals.calories}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                placeholder="2000"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">kcal</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Daily Protein Target
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="protein"
                value={goals.protein}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                placeholder="150"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">g</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Daily Carbs Target
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="carbs"
                value={goals.carbs}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                placeholder="250"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">g</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Daily Fat Target
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="fat"
                value={goals.fat}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                placeholder="70"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">g</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Daily Water Intake Target
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="waterIntake"
                value={goals.waterIntake}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                placeholder="2000"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">ml</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Meals per Day
            </label>
            <select
              name="mealsPerDay"
              value={goals.mealsPerDay}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value={2}>2 meals</option>
              <option value={3}>3 meals</option>
              <option value={4}>4 meals</option>
              <option value={5}>5 meals</option>
              <option value={6}>6 meals</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NutritionGoals;