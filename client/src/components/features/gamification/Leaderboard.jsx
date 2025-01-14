import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
                <div className="h-12 bg-zinc-800 rounded w-1/3"></div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-zinc-800 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <Feedback type="error" message={error} />;
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-800/50 rounded-lg border border-red-500/10 overflow-hidden"
        >
            <div className="p-4 sm:p-6 border-b border-red-500/10">
                <h2 className="text-lg font-medium text-orange-200">Fitness Leaderboard</h2>
                <p className="mt-1 text-sm text-orange-200/70">Top performers this month</p>
            </div>

            <ul className="divide-y divide-red-500/10">
                {leaderboard.map((entry, index) => (
                    <motion.li
                        key={entry.user?.id || entry._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 flex items-center space-x-4 ${
                            entry.rank <= 3 ? 'bg-black/20' : ''
                        }`}
                    >
                        {/* Rank */}
                        <div className="flex-shrink-0 w-8 text-center">
                            <span className={`
                                inline-flex items-center justify-center w-6 h-6 rounded-full 
                                ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                  entry.rank === 2 ? 'bg-zinc-500/20 text-zinc-400' :
                                  entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                                  'text-orange-200/50'}
                                font-semibold text-sm
                            `}>
                                {entry.rank}
                            </span>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-orange-200 truncate">
                                {entry.user?.name || entry.user?.email || 'Anonymous User'}
                            </p>
                            <p className="text-sm text-orange-200/70">
                                {entry.points} points
                            </p>
                        </div>

                        {/* Points Badge */}
                        <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                Level {Math.floor(entry.points / 100) + 1}
                            </span>
                        </div>

                        {/* Activity Stats */}
                        <div className="flex-shrink-0 text-sm text-orange-200/70">
                            {entry.totalActivities || 0} activities
                        </div>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
};

export default Leaderboard;