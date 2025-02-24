import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../../../server/config/env';
import Feedback from '../../common/Feedback';

const SocialStats = () => {
    const [stats, setStats] = useState({
        friends: 0,
        challenges: 0,
        points: 0,
        recentBadges: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No auth token found');
                }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Fetch all stats in parallel
                const [friendsRes, challengesRes, pointsRes, badgesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/social/friends`, { headers }),
                    fetch(`${API_BASE_URL}/social/challenges`, { headers }),
                    fetch(`${API_BASE_URL}/points`, { headers }),
                    fetch(`${API_BASE_URL}/gamification/badges`, { headers })
                ]);

                // Check if any request failed
                if (!friendsRes.ok || !challengesRes.ok || !pointsRes.ok || !badgesRes.ok) {
                    throw new Error('Failed to fetch social stats');
                }

                const [friends, challenges, points, badges] = await Promise.all([
                    friendsRes.json(),
                    challengesRes.json(),
                    pointsRes.json(),
                    badgesRes.json()
                ]);

                setStats({
                    friends: friends.length,
                    challenges: challenges.filter(c => c.status === 'active').length,
                    points: points.total || 0,
                    recentBadges: badges.slice(0, 3)
                });
            } catch (err) {
                console.error('Error fetching social stats:', err);
                setError('Failed to load social statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[200px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Feedback type="error" message={error} />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6"
        >
            <motion.h2
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-xl font-bold text-white mb-6"
            >
                Social Overview
            </motion.h2>

            <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                {/* Friends Stats */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/40 p-6 rounded-xl border border-orange-500/20 shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Friends</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.friends}</p>
                        </div>
                        <div className="p-3 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20">
                            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                {/* Active Challenges */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/40 p-6 rounded-xl border border-orange-500/20 shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Active Challenges</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.challenges}</p>
                        </div>
                        <div className="p-3 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20">
                            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                {/* Total Points */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/40 p-6 rounded-xl border border-orange-500/20 shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Points</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.points}</p>
                        </div>
                        <div className="p-3 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20">
                            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Badges */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/40 p-6 rounded-xl border border-orange-500/20 shadow-lg"
                >
                    <p className="text-gray-400 text-sm mb-4">Recent Badges</p>
                    {stats.recentBadges.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {stats.recentBadges.map((badge, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center"
                                    title={badge.name}
                                >
                                    <span className="text-white font-bold">
                                        {badge.name.charAt(0).toUpperCase()}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No badges earned yet</p>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default SocialStats;