import { useState, useEffect } from 'react';
import { motion} from 'framer-motion';
import PropTypes from 'prop-types';

const NutritionSummary = ({ refresh }) => {
    const [summary, setSummary] = useState(null);
    const [goals, setGoals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const [summaryResponse, goalsResponse] = await Promise.all([
                    fetch(`http://localhost:5000/nutrition/summary?startDate=${today.toISOString()}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }),
                    fetch('http://localhost:5000/nutrition/goals', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                ]);

                if (!summaryResponse.ok || !goalsResponse.ok) {
                    throw new Error('Failed to fetch nutrition data');
                }

                const [summaryData, goalsData] = await Promise.all([
                    summaryResponse.json(),
                    goalsResponse.json()
                ]);

                setSummary(summaryData);
                setGoals(goalsData.goals);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refresh]);

    const getProgressColor = (current, target) => {
        if (!target) return 'bg-gray-500';
        const percentage = (current / target) * 100;
        if (percentage < 70) return 'bg-gradient-to-r from-green-500 to-green-600';
        if (percentage < 90) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
        return 'bg-gradient-to-r from-red-500 to-red-600';
    };

    const getProgressPercentage = (current, target) => {
        if (!target) return 0;
        return Math.min((current / target) * 100, 100);
    };

    if (loading) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-black/90 flex justify-center items-center"
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
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/90 flex justify-center items-center"
            >
                <div className="bg-black/60 p-6 rounded-lg border border-red-500/20">
                    <p className="text-red-400">Error loading nutrition summary: {error}</p>
                </div>
            </motion.div>
        );
    }

    if (!summary) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-black/90 flex justify-center items-center"
            >
                <div className="bg-black/60 p-6 rounded-lg border border-orange-500/20">
                    <p className="text-gray-400">No nutrition data available for today</p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="bg-black/90 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto bg-black/60 p-8 rounded-2xl border border-orange-500/20 shadow-2xl"
            >
                <h2 className="text-2xl font-bold text-white mb-6">Today&apos;s Nutrition Summary</h2>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                    {[
                        { 
                            name: 'Calories', 
                            current: summary.totalCalories, 
                            goal: goals?.calories || 2000 
                        },
                        { 
                            name: 'Protein', 
                            current: summary.totalProtein, 
                            goal: goals?.protein || 150, 
                            unit: 'g' 
                        },
                        { 
                            name: 'Carbs', 
                            current: summary.totalCarbs, 
                            goal: goals?.carbs || 250, 
                            unit: 'g' 
                        },
                        { 
                            name: 'Fat', 
                            current: summary.totalFat, 
                            goal: goals?.fat || 70, 
                            unit: 'g' 
                        }
                    ].map((nutrient, index) => (
                        <motion.div 
                            key={nutrient.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                                opacity: 1, 
                                x: 0,
                                transition: { delay: index * 0.1 }
                            }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-black/30 p-4 rounded-lg border border-orange-500/20"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-400">{nutrient.name}</span>
                                <span className="text-sm text-white">
                                    {nutrient.current}{nutrient.unit || ''} / {nutrient.goal}{nutrient.unit || ''}
                                </span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ 
                                        width: `${getProgressPercentage(nutrient.current, nutrient.goal)}%`,
                                        transition: { duration: 0.5 }
                                    }}
                                    className={`${getProgressColor(nutrient.current, nutrient.goal)} h-2 rounded-full`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Meal Type Breakdown */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: 0.4 }
                    }}
                    className="mt-6"
                >
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Meals Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(summary.byMealType).map(([type, data], index) => (
                            <motion.div 
                                key={type}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ 
                                    opacity: 1, 
                                    x: 0,
                                    transition: { delay: index * 0.1 }
                                }}
                                whileHover={{ scale: 1.05 }}
                                className="bg-black/30 p-3 rounded border border-orange-500/20"
                            >
                                <div className="text-sm font-medium text-white capitalize">{type}</div>
                                <div className="text-gray-400 text-sm">{data.count} meals</div>
                                <div className="text-gray-400 text-sm">{data.calories} cal</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

NutritionSummary.propTypes = {
    refresh: PropTypes.bool.isRequired,
};

export default NutritionSummary;