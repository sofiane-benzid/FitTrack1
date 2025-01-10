import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Feedback from '../../common/Feedback';

const UserProfileModal = ({ userId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://localhost:5000/social/users/${userId}/profile`, {
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

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <Feedback type="error" message={error} />
                    <button
                        onClick={onClose}
                        className="mt-4 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">User Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium">{profile.fullName}</h3>
                        <p className="text-gray-500">{profile.email}</p>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Total Workouts</p>
                                <p className="text-lg font-medium">{profile.stats?.totalWorkouts || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Workout Streak</p>
                                <p className="text-lg font-medium">{profile.stats?.workoutStreak || 0} days</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Fitness Goals</h4>
                        <div className="flex flex-wrap gap-2">
                            {profile.fitnessGoals?.map((goal, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                                >
                                    {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Recent Achievements</h4>
                        {profile.achievements?.length > 0 ? (
                            <div className="space-y-2">
                                {profile.achievements.map((achievement, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-2 text-sm"
                                    >
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span>{achievement.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No achievements yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

UserProfileModal.propTypes = {
    userId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

// MessageModal.jsx
const MessageModal = ({ recipientId, recipientName, onClose }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);

        try {
            const response = await fetch('http://localhost:5000/social/messages', {
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

            // Clear message input
            setMessage('');

            // Close modal after short delay
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Message {recipientName}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {feedback && (
                    <div className="mb-4">
                        <Feedback
                            type={feedback.type}
                            message={feedback.message}
                            onClose={() => setFeedback(null)}
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="4"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Type your message here..."
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

MessageModal.propTypes = {
    recipientId: PropTypes.string.isRequired,
    recipientName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

export { UserProfileModal, MessageModal };