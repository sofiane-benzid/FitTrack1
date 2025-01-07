import { useState, useEffect } from 'react';
import { gamificationService } from '../../../services/gamificationService';
import Feedback from '../../common/Feedback';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const data = await gamificationService.getLeaderboard();
            setLeaderboard(data);
        } catch (err) {
            setError('Failed to load leaderboard');
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <Feedback type="error" message={error} />;
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Fitness Leaderboard</h2>
                <p className="mt-1 text-sm text-gray-500">Top performers this month</p>
            </div>

            <ul className="divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                    <li
                        key={entry.user.id}
                        className={`p-4 flex items-center space-x-4 ${index < 3 ? 'bg-gray-50' : ''}`}
                    >
                        {/* Rank */}
                        <div className="flex-shrink-0 w-8 text-center">
                            <span className={`
                inline-flex items-center justify-center w-6 h-6 rounded-full 
                ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                        index === 2 ? 'bg-orange-100 text-orange-800' :
                                            'text-gray-500'}
                font-semibold text-sm
              `}>
                                {index + 1}
                            </span>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {entry.user.name || entry.user.email}
                            </p>
                            <p className="text-sm text-gray-500">
                                {entry.stats.totalWorkouts} workouts • {entry.stats.totalMinutes} minutes
                            </p>
                        </div>

                        {/* Points */}
                        <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {entry.points} pts
                            </span>
                        </div>

                        {/* Streak */}
                        {entry.stats.workoutStreak > 0 && (
                            <div className="flex-shrink-0">
                                <span className="inline-flex items-center text-xs text-gray-500">
                                    <svg className="w-4 h-4 text-red-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                    </svg>
                                    {entry.stats.workoutStreak} day streak
                                </span>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;