import { useState, useEffect } from 'react';
import Feedback from '../../common/Feedback';
import PropTypes from 'prop-types';

const MealList = ({ refresh }) => {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [expandedMeal, setExpandedMeal] = useState(null);
    const [filter, setFilter] = useState({
        type: 'all',
        startDate: '',
        endDate: ''
    });

    const mealTypes = [
        { value: 'all', label: 'All Meals' },
        { value: 'breakfast', label: 'Breakfast' },
        { value: 'lunch', label: 'Lunch' },
        { value: 'dinner', label: 'Dinner' },
        { value: 'snack', label: 'Snack' }
    ];

    const fetchMeals = async () => {
        try {
            let url = 'http://localhost:5000/nutrition/meals';
            const queryParams = [];

            if (filter.type !== 'all') {
                queryParams.push(`type=${filter.type}`);
            }
            if (filter.startDate) {
                queryParams.push(`startDate=${filter.startDate}`);
            }
            if (filter.endDate) {
                queryParams.push(`endDate=${filter.endDate}`);
            }

            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch meals');
            }

            const data = await response.json();
            setMeals(data);
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, [filter, refresh]);

    const deleteMeal = async (mealId) => {
        if (!window.confirm('Are you sure you want to delete this meal?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/nutrition/meals/${mealId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete meal');
            }

            setFeedback({
                type: 'success',
                message: 'Meal deleted successfully'
            });

            fetchMeals();
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error.message
            });
        }
    };

    const renderMealDetails = (meal) => {
        const isExpanded = expandedMeal === meal._id;

        return (
            <div key={meal._id} className="border rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
                {/* Meal Header */}
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedMeal(isExpanded ? null : meal._id)}
                >
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium">
                                    {meal.type.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">{meal.name}</h3>
                            <p className="text-sm text-gray-500">
                                {new Date(meal.date).toLocaleDateString()} - {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-lg font-medium text-gray-900">
                            {meal.totalCalories} cal
                        </span>
                        <svg
                            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t px-4 py-3 bg-gray-50">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <span className="block text-sm font-medium text-gray-500">Protein</span>
                                <span className="text-lg text-gray-900">{meal.totalProtein}g</span>
                            </div>
                            <div>
                                <span className="block text-sm font-medium text-gray-500">Carbs</span>
                                <span className="text-lg text-gray-900">{meal.totalCarbs}g</span>
                            </div>
                            <div>
                                <span className="block text-sm font-medium text-gray-500">Fat</span>
                                <span className="text-lg text-gray-900">{meal.totalFat}g</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Foods</h4>
                            {meal.foods.map((food, index) => (
                                <div key={index} className="bg-white p-3 rounded border">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{food.name}</span>
                                        <span className="text-gray-500">
                                            {food.quantity}{food.unit} - {food.calories} cal
                                        </span>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500">
                                        P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                                    </div>
                                </div>
                            ))}
                        </div>

                        {meal.notes && (
                            <div className="mt-4">
                                <h4 className="font-medium text-gray-900">Notes</h4>
                                <p className="text-gray-700 mt-1">{meal.notes}</p>
                            </div>
                        )}

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMeal(meal._id);
                                }}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Delete Meal
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Loading meals...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {feedback && (
                <Feedback
                    type={feedback.type}
                    message={feedback.message}
                    onClose={() => setFeedback(null)}
                />
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Meal Filters</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                        <select
                            value={filter.type}
                            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            {mealTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filter.startDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filter.endDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Meal List */}
            <div className="space-y-4">
                {meals.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">No meals found</p>
                    </div>
                ) : (
                    meals.map(meal => renderMealDetails(meal))
                )}
            </div>
        </div>
    );
};

MealList.propTypes ={
    refresh: PropTypes.func.isRequired
}

export default MealList;