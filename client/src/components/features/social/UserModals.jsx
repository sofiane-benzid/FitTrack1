import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../../../server/config/env';
import Feedback from '../../common/Feedback';

export const UserProfileModal = ({ userId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/social/users/${userId}/profile`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const data = await response.json();
                setProfile(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-black/40 rounded-xl p-6 max-w-md w-full border border-blue-500/20 shadow-lg"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">User Profile</h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </motion.button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                        {error}
                    </div>
                ) : profile && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">
                                    {profile.fullName?.charAt(0) || profile.email.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-white">{profile.fullName}</h3>
                                <p className="text-gray-400">{profile.email}</p>
                            </div>
                        </div>

                        <div className="border-t border-blue-500/20 pt-4">
                            <h4 className="text-lg font-medium text-white mb-3">Stats</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/40 p-4 rounded-lg border border-blue-500/10">
                                    <p className="text-gray-400 text-sm">Total Workouts</p>
                                    <p className="text-xl font-medium text-white">{profile.stats?.totalWorkouts || 0}</p>
                                </div>
                                <div className="bg-black/40 p-4 rounded-lg border border-blue-500/10">
                                    <p className="text-gray-400 text-sm">Workout Streak</p>
                                    <p className="text-xl font-medium text-white">{profile.stats?.workoutStreak || 0} days</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-blue-500/20 pt-4">
                            <h4 className="text-lg font-medium text-white mb-3">Fitness Goals</h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.fitnessGoals?.map((goal, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400"
                                    >
                                        {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-blue-500/20 pt-4">
                            <h4 className="text-lg font-medium text-white mb-3">Recent Achievements</h4>
                            {profile.achievements?.length > 0 ? (
                                <div className="space-y-2">
                                    {profile.achievements.map((achievement, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
                                            <span className="text-gray-300">{achievement.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No achievements yet</p>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export const MessageModal = ({ recipientId, recipientName, onClose }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);

        try {
            const response = await fetch(`${API_BASE_URL}/social/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    recipientId,
                    content: message
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            setFeedback({
                type: 'success',
                message: 'Message sent successfully!'
            });
            setMessage('');
            setTimeout(onClose, 1500);
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-black/40 rounded-xl p-6 max-w-md w-full border border-blue-500/20 shadow-lg"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Message {recipientName}</h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </motion.button>
                </div>

                {feedback && (
                    <Feedback
                        type={feedback.type}
                        message={feedback.message}
                        onClose={() => setFeedback(null)}
                    />
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="4"
                            className="w-full bg-black/40 border border-blue-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
                            placeholder="Type your message here..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-black/40 text-white rounded-lg hover:bg-black/60"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

UserProfileModal.propTypes = {
    userId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

MessageModal.propTypes = {
    recipientId: PropTypes.string.isRequired,
    recipientName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

export default {
    UserProfileModal,
    MessageModal
};