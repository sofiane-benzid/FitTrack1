import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Feedback from '../../common/Feedback';
import { useAuth } from '../../../hooks/useAuth';
import { API_BASE_URL } from '../../../../../server/config/env';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/gamification/leaderboard`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch leaderboard');
            const data = await response.json();
            setLeaderboard(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return <Feedback type="error" message={error} />;
    }

    const getRankColor = (rank) => {
        switch (rank) {
            case 1: return 'from-yellow-500 to-yellow-600';
            case 2: return 'from-slate-400 to-slate-500';
            case 3: return 'from-orange-500 to-orange-600';
            default: return 'from-red-500/20 to-orange-500/20';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 rounded-xl border border-orange-500/20"
        >
            <div className="p-6 border-b border-orange-500/20">
                <h2 className="text-lg font-medium text-white">Fitness Leaderboard</h2>
                <p className="mt-1 text-sm text-orange-200/70">Top performers this month</p>
            </div>

            <ul className="divide-y divide-orange-500/10">
                {leaderboard.length === 0 ? (
                    <li className="p-6 text-center text-gray-400">No data available</li>
                ) : (
                    leaderboard.map((entry, index) => (
                        <motion.li
                            key={entry.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 flex items-center space-x-4 ${entry.userId === user?.id ? 'bg-red-500/10' : ''
                                }`}
                        >
                            {/* Rank Badge */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(index + 1)}
                            flex items-center justify-center font-bold text-white`}>
                                {index + 1}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                    {entry.fullName || entry.email}
                                </p>
                                <p className="text-orange-200/70 text-sm">
                                    Level {Math.floor(entry.totalPoints / 100) + 1}
                                </p>
                            </div>

                            {/* Points */}
                            <div className="text-right">
                                <p className="text-white font-medium">{entry.totalPoints} points</p>
                                <p className="text-orange-200/70 text-sm">{entry.totalActivities} activities</p>
                            </div>
                        </motion.li>
                    ))
                )}
            </ul>
        </motion.div>
    );
};

export default Leaderboard;