import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Feedback from '../../common/Feedback';

const Badges = () => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBadges = async () => {
        try {
            const response = await fetch('http://localhost:5000/auth/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch badges');
            }

            const data = await response.json();
            setBadges(data.achievements || []);
        } catch (err) {
            console.error('Error fetching badges:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBadges();
    }, []);

    const getBadgeIcon = (type) => {
        switch (type) {
            case 'workout':
                return '💪';
            case 'nutrition':
                return '🥗';
            case 'streak':
                return '🔥';
            default:
                return '🏆';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {error && <Feedback type="error" message={error} />}

            <div className="bg-zinc-800/50 rounded-lg border border-red-500/10 overflow-hidden">
                <div className="p-6 border-b border-red-500/10">
                    <h2 className="text-lg font-medium text-orange-200">Your Badges</h2>
                    <p className="mt-1 text-sm text-orange-200/70">
                        Achievements you&apos;ve earned through your fitness journey
                    </p>
                </div>

                <div className="p-6">
                    {badges.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-8"
                        >
                            <div className="text-4xl mb-4">🏆</div>
                            <p className="text-orange-200/50">Complete activities to earn badges!</p>
                            <p className="text-sm text-orange-200/30 mt-2">
                                Work out, log meals, and maintain streaks to unlock achievements
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {badges.map((badge, index) => (
                                <motion.div
                                    key={badge._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-black/20 border border-red-500/10 rounded-lg p-4 hover:border-red-500/30 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 text-xl">
                                            {getBadgeIcon(badge.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-orange-200">{badge.name}</h3>
                                            <p className="text-sm text-orange-200/70">{badge.description}</p>
                                            <p className="text-xs text-orange-200/50 mt-1">
                                                Earned {new Date(badge.earnedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Badges;