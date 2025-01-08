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
                {leaderboard.map((entry) => (
                    <li
                        key={entry.user?.id || entry._id}
                        className={`p-4 flex items-center space-x-4 ${
                            entry.rank <= 3 ? 'bg-gray-50' : ''
                        }`}
                    >
                        {/* Rank */}
                        <div className="flex-shrink-0 w-8 text-center">
                            <span className={`
                                inline-flex items-center justify-center w-6 h-6 rounded-full 
                                ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                  entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                  entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                                  'text-gray-500'}
                                font-semibold text-sm
                            `}>
                                {entry.rank}
                            </span>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {entry.user?.name || entry.user?.email || 'Anonymous User'}
                            </p>
                            <p className="text-sm text-gray-500">
                                {entry.points} points
                            </p>
                        </div>

                        {/* Points Badge */}
                        <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Level {Math.floor(entry.points / 100) + 1}
                            </span>
                        </div>

                        {/* Activity Stats */}
                        <div className="flex-shrink-0 text-sm text-gray-500">
                            {entry.totalActivities || 0} activities
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;