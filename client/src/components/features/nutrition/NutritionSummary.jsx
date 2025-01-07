import { useState, useEffect } from 'react';

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

                // Fetch summary and goals in parallel
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
        if (percentage < 70) return 'bg-green-500';
        if (percentage < 90) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getProgressPercentage = (current, target) => {
        if (!target) return 0;
        return Math.min((current / target) * 100, 100);
    };

    if (loading) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">Error loading nutrition summary: {error}</p>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-500">No nutrition data available for today</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Nutrition Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Calories */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Calories</span>
                        <span className="text-sm text-gray-900">
                            {summary.totalCalories} / {goals?.calories || '2000'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`${getProgressColor(summary.totalCalories, goals?.calories)} h-2 rounded-full transition-all`}
                            style={{ width: `${getProgressPercentage(summary.totalCalories, goals?.calories)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Protein */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Protein</span>
                        <span className="text-sm text-gray-900">
                            {summary.totalProtein}g / {goals?.protein || '150'}g
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`${getProgressColor(summary.totalProtein, goals?.protein)} h-2 rounded-full transition-all`}
                            style={{ width: `${getProgressPercentage(summary.totalProtein, goals?.protein)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Carbs */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Carbs</span>
                        <span className="text-sm text-gray-900">
                            {summary.totalCarbs}g / {goals?.carbs || '250'}g
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`${getProgressColor(summary.totalCarbs, goals?.carbs)} h-2 rounded-full transition-all`}
                            style={{ width: `${getProgressPercentage(summary.totalCarbs, goals?.carbs)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Fat */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Fat</span>
                        <span className="text-sm text-gray-900">
                            {summary.totalFat}g / {goals?.fat || '70'}g
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`${getProgressColor(summary.totalFat, goals?.fat)} h-2 rounded-full transition-all`}
                            style={{ width: `${getProgressPercentage(summary.totalFat, goals?.fat)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Meal Type Breakdown */}
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Meals Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(summary.byMealType).map(([type, data]) => (
                        <div key={type} className="bg-gray-50 p-3 rounded">
                            <div className="text-sm font-medium capitalize">{type}</div>
                            <div className="text-gray-500 text-sm">{data.count} meals</div>
                            <div className="text-gray-500 text-sm">{data.calories} cal</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NutritionSummary;