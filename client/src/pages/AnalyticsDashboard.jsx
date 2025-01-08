import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/common/PageHeader';

const AnalyticsDashboard = () => {
    useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState({
        workoutTrends: [],
        nutritionTrends: [],
        recommendations: []
    });

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                // Fetch workout data
                const workoutResponse = await fetch('http://localhost:5000/activity/list', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Fetch nutrition data
                const nutritionResponse = await fetch('http://localhost:5000/nutrition/meals', {
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">Error loading analytics: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Analytics Dashboard" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workout Trends Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Workout Trends</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.workoutTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="calories"
                                    stroke="#8884d8"
                                    name="Calories Burned"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="duration"
                                    stroke="#82ca9d"
                                    name="Duration (min)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Nutrition Trends Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Nutrition Trends</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.nutritionTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="calories"
                                    stroke="#8884d8"
                                    name="Calories Consumed"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="protein"
                                    stroke="#82ca9d"
                                    name="Protein (g)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Personalized Recommendations</h2>
                {analyticsData.recommendations.length === 0 ? (
                    <p className="text-gray-500">No recommendations available yet. Keep tracking your progress!</p>
                ) : (
                    <div className="space-y-4">
                        {analyticsData.recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg ${rec.type === 'workout' ? 'bg-indigo-50' : 'bg-green-50'
                                    }`}
                            >
                                <div className="flex items-start">
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${rec.type === 'workout' ? 'bg-indigo-100' : 'bg-green-100'
                                            }`}
                                    >
                                        {rec.type === 'workout' ? (
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className={`ml-3 text-sm ${rec.type === 'workout' ? 'text-indigo-700' : 'text-green-700'
                                        }`}>
                                        {rec.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;