import { useState, useEffect } from 'react';
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
                    fetch('http://localhost:5000/social/friends', { headers }),
                    fetch('http://localhost:5000/social/challenges', { headers }),
                    fetch('http://localhost:5000/gamification/points', { headers }),
                    fetch('http://localhost:5000/gamification/badges', { headers })
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
            <div className="p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <Feedback type="error" message={error} />;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Friends</p>
                            <p className="text-2xl font-bold text-indigo-600">{stats.friends}</p>
                        </div>
                        <div className="bg-indigo-100 p-2 rounded-full">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Challenges</p>
                            <p className="text-2xl font-bold text-green-600">{stats.challenges}</p>
                        </div>
                        <div className="bg-green-100 p-2 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Points</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.points}</p>
                        </div>
                        <div className="bg-yellow-100 p-2 rounded-full">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500 mb-2">Recent Badges</p>
                    {stats.recentBadges.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {stats.recentBadges.map((badge, index) => (
                                <div
                                    key={index}
                                    className="bg-purple-100 p-2 rounded-full"
                                    title={badge.name}
                                >
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <span className="text-sm font-medium text-purple-600">
                                            {badge.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No badges earned yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialStats;