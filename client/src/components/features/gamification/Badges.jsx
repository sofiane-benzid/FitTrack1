import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gamificationService } from '../../../services/gamificationService';
import Feedback from '../../common/Feedback';

const Badges = () => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            const data = await gamificationService.getBadges();
            setBadges(data);
        } catch (err) {
            setError('Failed to load badges');
            console.error('Error fetching badges:', err);
        } finally {
            setLoading(false);
        }
    };

    const getBadgeIcon = (type) => {
        switch (type) {
            case 'workout':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
            case 'nutrition':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                );
            case 'social':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case 'challenge':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-12 bg-zinc-800 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-zinc-800 rounded"></div>
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
            className="space-y-6"
        >
            <div className="bg-zinc-800/50 rounded-lg border border-red-500/10 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-red-500/10">
                    <h2 className="text-lg font-medium text-orange-200">Your Badges</h2>
                    <p className="mt-1 text-sm text-orange-200/70">
                        Achievements you&apos;ve earned through your fitness journey
                    </p>
                </div>

                {badges.length === 0 ? (
                    <div className="p-4 text-center text-orange-200/50">
                        <p>No badges earned yet. Keep up the good work to earn some!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {badges.map((badge, index) => (
                            <motion.div
                                key={badge._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-black/20 border border-red-500/10 rounded-lg p-4 hover:border-red-500/30 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`
                                        p-3 rounded-full
                                        ${badge.type === 'workout' ? 'bg-red-500/20 text-red-400' :
                                          badge.type === 'nutrition' ? 'bg-orange-500/20 text-orange-400' :
                                          badge.type === 'social' ? 'bg-red-500/20 text-red-400' :
                                          'bg-orange-500/20 text-orange-400'}
                                    `}>
                                        {getBadgeIcon(badge.type)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-orange-200">{badge.name}</h3>
                                        <p className="text-sm text-orange-200/70">{badge.description}</p>
                                        <p className="text-xs text-orange-200/50 mt-1">
                                            Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Badges;