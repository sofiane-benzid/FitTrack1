import  { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Feedback from '../../common/Feedback';
import PropTypes from 'prop-types';
import { API_BASE_URL } from '../../../../../server/config/env';

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
            let url = `${API_BASE_URL}/nutrition/meals`;
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
            const response = await fetch(`${API_BASE_URL}/nutrition/meals/${mealId}`, {
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
            <motion.div 
                key={meal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="border rounded-lg mb-4 overflow-hidden bg-black/60 border-orange-500/20 shadow-2xl"
            >
                {/* Meal Header */}
                <motion.div
                    whileHover={{ 
                        backgroundColor: 'rgba(249, 88, 44, 0.1)',
                        transition: { duration: 0.2 }
                    }}
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedMeal(isExpanded ? null : meal._id)}
                >
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {meal.type.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">{meal.name}</h3>
                            <p className="text-sm text-gray-400">
                                {new Date(meal.date).toLocaleDateString()} - {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-lg font-medium text-white">
                            {meal.totalCalories} cal
                        </span>
                        <motion.svg
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </motion.svg>
                    </div>
                </motion.div>

                {/* Expanded Details */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ 
                                opacity: 1, 
                                height: 'auto',
                                transition: { 
                                    duration: 0.3,
                                    height: { duration: 0.3 }
                                }
                            }}
                            exit={{ 
                                opacity: 0, 
                                height: 0,
                                transition: { 
                                    duration: 0.3,
                                    height: { duration: 0.3 }
                                }
                            }}
                            className="border-t border-orange-500/20 px-4 py-3 bg-black/40"
                        >
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {['Protein', 'Carbs', 'Fat'].map((nutrient, index) => (
                                    <motion.div 
                                        key={nutrient}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ 
                                            opacity: 1, 
                                            x: 0,
                                            transition: { delay: index * 0.1 }
                                        }}
                                    >
                                        <span className="block text-sm font-medium text-gray-400">{nutrient}</span>
                                        <span className="text-lg text-white">
                                            {meal[`total${nutrient}`]}g
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-medium text-white">Foods</h4>
                                {meal.foods.map((food, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ 
                                            opacity: 1, 
                                            x: 0,
                                            transition: { delay: index * 0.1 }
                                        }}
                                        className="bg-black/30 p-3 rounded border border-orange-500/20"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-white">{food.name}</span>
                                            <span className="text-gray-400">
                                                {food.quantity}{food.unit} - {food.calories} cal
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-500">
                                            P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {meal.notes && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-white">Notes</h4>
                                    <p className="text-gray-300 mt-1">{meal.notes}</p>
                                </div>
                            )}

                            <div className="mt-4 flex justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteMeal(meal._id);
                                    }}
                                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                                >
                                    Delete Meal
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center py-8"
            >
                <motion.div 
                    animate={{ 
                        rotate: 360,
                        transition: { 
                            repeat: Infinity, 
                            duration: 1, 
                            ease: "linear" 
                        }
                    }}
                    className="h-8 w-8 border-4 border-transparent border-b-red-500 rounded-full"
                />
                <span className="ml-2 text-gray-400">Loading meals...</span>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4 bg-black/90 min-h-screen p-6">
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

            {/* Filters */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/60 p-4 rounded-lg border border-orange-500/20 shadow-2xl space-y-4"
            >
                <h2 className="text-lg font-medium text-white">Meal Filters</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Meal Type</label>
                        <select
                            value={filter.type}
                            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full rounded-md bg-black/60 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
                        >
                            {mealTypes.map(type => (
                                <option key={type.value} value={type.value} className="bg-black text-white">
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filter.startDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full rounded-md bg-black/60 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filter.endDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full rounded-md bg-black/60 border-orange-500/20 text-white focus:border-orange-500 focus:ring-orange-500"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Meal List */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
            >
                <AnimatePresence>
                    {meals.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 bg-black/60 rounded-lg border border-orange-500/20"
                        >
                            <p className="text-gray-400">No meals found</p>
                        </motion.div>
                    ) : (
                        meals.map(meal => renderMealDetails(meal))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

MealList.propTypes = {
    refresh: PropTypes.func.isRequired
}

export default MealList;