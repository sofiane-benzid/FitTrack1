import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/common/PageHeader';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../../server/config/env';

const AnalyticsDashboard = () => {
    useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState({
        workoutTrends: [],
        nutritionTrends: [],
        recommendations: []
    });

    const chartConfig = {
        backgroundColor: "#18181b", // zinc-900

        workoutColors: {
            calories: "#ef4444", // red-500
            duration: "#fb923c"  // orange-400
        },
        nutritionColors: {
            calories: "#ef4444", // red-500
            protein: "#fb923c"   // orange-400
        },
        gridColor: "rgba(255, 255, 255, 0.1)",
        textColor: "#fed7aa" // orange-200
    };

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                // Fetch workout data
                const workoutResponse = await fetch(`${API_BASE_URL}/activity/list`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Fetch nutrition data
                const nutritionResponse = await fetch(`${API_BASE_URL}/nutrition/meals`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!workoutResponse.ok || !nutritionResponse.ok) {
                    throw new Error('Failed to fetch analytics data');
                }

                const workoutData = await workoutResponse.json();
                const nutritionData = await nutritionResponse.json();

                // Process data for charts
                const processedData = processAnalyticsData(workoutData, nutritionData);
                setAnalyticsData(processedData);

                // Generate recommendations
                const recommendations = generateRecommendations(processedData);
                setAnalyticsData(prev => ({
                    ...prev,
                    recommendations
                }));

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    const processAnalyticsData = (workoutData, nutritionData) => {
        // Group workout data by date
        const workoutTrends = workoutData.reduce((acc, workout) => {
            const date = new Date(workout.date).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = { date, calories: 0, duration: 0 };
            }
            acc[date].calories += workout.calories || 0;
            acc[date].duration += workout.duration || 0;
            return acc;
        }, {});

        // Group nutrition data by date
        const nutritionTrends = nutritionData.reduce((acc, meal) => {
            const date = new Date(meal.date).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = { date, calories: 0, protein: 0 };
            }
            acc[date].calories += meal.totalCalories || 0;
            acc[date].protein += meal.totalProtein || 0;
            return acc;
        }, {});

        return {
            workoutTrends: Object.values(workoutTrends),
            nutritionTrends: Object.values(nutritionTrends)
        };
    };

    const generateRecommendations = (data) => {
        const recommendations = [];

        // Analyze workout consistency
        const workoutDays = data.workoutTrends.length;
        const totalDuration = data.workoutTrends.reduce((sum, day) => sum + day.duration, 0);
        const avgDuration = totalDuration / workoutDays || 0;

        if (workoutDays < 3) {
            recommendations.push({
                type: 'workout',
                message: 'Try to work out at least 3 times per week for better results'
            });
        }

        if (avgDuration < 30) {
            recommendations.push({
                type: 'workout',
                message: 'Aim for at least 30 minutes per workout session'
            });
        }

        // Analyze nutrition
        const nutritionDays = data.nutritionTrends.length;
        const avgCalories = data.nutritionTrends.reduce((sum, day) => sum + day.calories, 0) / nutritionDays || 0;
        const avgProtein = data.nutritionTrends.reduce((sum, day) => sum + day.protein, 0) / nutritionDays || 0;

        if (avgCalories < 1500) {
            recommendations.push({
                type: 'nutrition',
                message: 'Your calorie intake seems low. Consider increasing it for better energy levels'
            });
        }

        if (avgProtein < 50) {
            recommendations.push({
                type: 'nutrition',
                message: 'Try to increase your protein intake for better muscle recovery'
            });
        }

        return recommendations;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500/20 border-t-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                <p className="text-red-400">Error loading analytics: {error}</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-zinc-900 p-6 space-y-6"
        >
            <div className="max-w-7xl mx-auto">
                <PageHeader title="Analytics Dashboard" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workout Trends Chart */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-zinc-800/50 border border-red-500/10 p-6 rounded-lg"
                >
                    <h2 className="text-lg font-medium text-orange-200 mb-4">Workout Trends</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.workoutTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke={chartConfig.textColor}
                                    tick={{ fill: chartConfig.textColor }}
                                />
                                <YAxis 
                                    yAxisId="left" 
                                    stroke={chartConfig.textColor}
                                    tick={{ fill: chartConfig.textColor }}
                                />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right" 
                                    stroke={chartConfig.textColor}
                                    tick={{ fill: chartConfig.textColor }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        borderRadius: '8px',
                                        color: chartConfig.textColor 
                                    }}
                                />
                                <Legend wrapperStyle={{ color: chartConfig.textColor }} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="calories"
                                    stroke={chartConfig.workoutColors.calories}
                                    name="Calories Burned"
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="duration"
                                    stroke={chartConfig.workoutColors.duration}
                                    name="Duration (min)"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Nutrition Trends Chart */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/20 border border-red-500/10 p-6 rounded-lg"
                >
                    <h2 className="text-lg font-medium text-orange-200 mb-4">Nutrition Trends</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.nutritionTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke={chartConfig.textColor}
                                    tick={{ fill: chartConfig.textColor }}
                                />
                                <YAxis 
                                    yAxisId="left" 
                                    stroke={chartConfig.textColor}
                                    tick={{ fill: chartConfig.textColor }}
                                />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right" 
                                    stroke={chartConfig.textColor}
                                    tick={{ fill: chartConfig.textColor }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        borderRadius: '8px',
                                        color: chartConfig.textColor 
                                    }}
                                />
                                <Legend wrapperStyle={{ color: chartConfig.textColor }} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="calories"
                                    stroke={chartConfig.nutritionColors.calories}
                                    name="Calories Consumed"
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="protein"
                                    stroke={chartConfig.nutritionColors.protein}
                                    name="Protein (g)"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Recommendations */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-black/20 border border-red-500/10 p-6 rounded-lg"
            >
                <h2 className="text-lg font-medium text-orange-200 mb-4">Personalized Recommendations</h2>
                {analyticsData.recommendations.length === 0 ? (
                    <p className="text-orange-200/70">No recommendations available yet. Keep tracking your progress!</p>
                ) : (
                    <div className="space-y-4">
                        {analyticsData.recommendations.map((rec, index) => (
                            <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-lg ${
                                    rec.type === 'workout' 
                                        ? 'bg-red-500/10 border border-red-500/20' 
                                        : 'bg-orange-500/10 border border-orange-500/20'
                                }`}
                            >
                                <div className="flex items-start">
                                    <div className={`
                                        flex-shrink-0 w-8 h-8 rounded-full 
                                        flex items-center justify-center 
                                        ${rec.type === 'workout' 
                                            ? 'bg-red-500/20' 
                                            : 'bg-orange-500/20'
                                        }
                                    `}>
                                        {rec.type === 'workout' ? (
                                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className={`ml-3 text-sm ${
                                        rec.type === 'workout' 
                                            ? 'text-red-400' 
                                            : 'text-orange-400'
                                    }`}>
                                        {rec.message}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default AnalyticsDashboard;