import { useState } from 'react';
import Feedback from '../../common/Feedback';

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
      // Convert string values to numbers in the foods array
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

      console.log('Sending processed meal data:', processedData);

      const response = await fetch('http://localhost:5000/nutrition/meals', {
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

      const data = await response.json();

      setFeedback({
        type: 'success',
        message: 'Meal logged successfully!'
      });

      // Reset form
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
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      {feedback && (
        <Feedback
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Meal Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Meal Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {mealTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Food Input Section */}
        <div className="border p-4 rounded-md bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Foods</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Food Name</label>
              <input
                type="text"
                name="name"
                value={currentFood.name}
                onChange={handleFoodChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={currentFood.quantity}
                  onChange={handleFoodChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                  name="unit"
                  value={currentFood.unit}
                  onChange={handleFoodChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="g">grams</option>
                  <option value="ml">milliliters</option>
                  <option value="oz">ounces</option>
                  <option value="serving">serving</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Calories</label>
              <input
                type="number"
                name="calories"
                value={currentFood.calories}
                onChange={handleFoodChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
                <input
                  type="number"
                  name="protein"
                  value={currentFood.protein}
                  onChange={handleFoodChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                <input
                  type="number"
                  name="carbs"
                  value={currentFood.carbs}
                  onChange={handleFoodChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
                <input
                  type="number"
                  name="fat"
                  value={currentFood.fat}
                  onChange={handleFoodChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={addFood}
            className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            Add Food
          </button>
        </div>

        {/* Food List */}
        {formData.foods.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Added Foods</h3>
            <div className="space-y-2">
              {formData.foods.map((food, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <div>
                    <span className="font-medium">{food.name}</span>
                    <span className="text-gray-500 ml-2">
                      {food.quantity}{food.unit} - {food.calories} cal
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFood(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {loading ? 'Logging Meal...' : 'Log Meal'}
        </button>
      </form>
    </div>
  );
};

export default MealTracker;