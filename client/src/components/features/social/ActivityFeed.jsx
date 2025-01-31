import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import Feedback from '../../common/Feedback';

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [setError] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch('http://localhost:5000/activity/feed', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch activities');
                const data = await response.json();
                setActivities(data);
            } catch (err) {
                setError('Error loading activity feed');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [setError]);



    const handleReaction = async (activityId, type) => {
        try {
            const response = await fetch(`http://localhost:5000/activity/${activityId}/react`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ type })
            });

            if (!response.ok) throw new Error('Failed to add reaction');

            // Update activities state to reflect the new reaction
            setActivities(prev => prev.map(activity => {
                if (activity._id === activityId) {
                    const updatedActivity = { ...activity };
                    // Update reactions
                    const existingReaction = updatedActivity.reactions.find(
                        r => r.user === user.id
                    );
                    if (existingReaction) {
                        existingReaction.type = type;
                    } else {
                        updatedActivity.reactions.push({ user: user.id, type });
                    }
                    return updatedActivity;
                }
                return activity;
            }));

            setFeedback({
                type: 'success',
                message: 'Reaction added!'
            });
        } catch (err) {
            setError('Failed to add reaction');
            console.error('Error:', err);
        }
    };

    const handleComment = async (activityId, comment) => {
        try {
            const response = await fetch(`http://localhost:5000/activity/${activityId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content: comment })
            });

            if (!response.ok) throw new Error('Failed to add comment');

            // Update activities state with the new comment
            const updatedActivity = await response.json();
            setActivities(prev => prev.map(activity =>
                activity._id === activityId ? updatedActivity : activity
            ));

            setFeedback({
                type: 'success',
                message: 'Comment added!'
            });
        } catch (err) {
            setError('Failed to add comment');
            console.error('Error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {feedback && (
                    <Feedback
                        type={feedback.type}
                        message={feedback.message}
                        onClose={() => setFeedback(null)}
                    />
                )}
            </AnimatePresence>

            {activities.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 bg-black/60 rounded-xl border border-orange-500/20"
                >
                    <p className="text-gray-400">No activities in your feed yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Follow more friends to see their fitness activities
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <motion.div
                            key={activity._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-black/60 rounded-xl border border-orange-500/20 overflow-hidden"
                        >
                            {/* Activity Header */}
                            <div className="p-4 border-b border-orange-500/20">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                                            <span className="text-white font-bold">
                                                {activity.user.profile?.fullName?.charAt(0) || activity.user.email.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-white font-medium">
                                            {activity.user.profile?.fullName || activity.user.email}
                                        </p>
                                        <p className="text-sm text-orange-200/70">
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Activity Content */}
                                <div className="p-4">
                                    <div className="text-white">
                                        <span className="text-orange-400 font-medium">
                                            {activity.type}
                                        </span>
                                        {activity.duration && ` for ${activity.duration} minutes`}
                                        {activity.distance && ` - ${activity.distance}km`}
                                    </div>
                                    {activity.notes && (
                                        <p className="mt-2 text-orange-200/70">{activity.notes}</p>
                                    )}
                                </div>

                                {/* Reactions */}
                                <div className="px-4 py-2 bg-black/20 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        {['like', 'celebrate', 'support'].map((type) => (
                                            <motion.button
                                                key={type}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleReaction(activity._id, type)}
                                                className={`px-3 py-1 rounded-full text-sm ${activity.reactions?.some(
                                                    r => r.user === user.id && r.type === type
                                                )
                                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                                    : 'bg-black/40 text-orange-200 hover:bg-black/60'
                                                    }`}
                                            >
                                                {type === 'like' && '👍'}
                                                {type === 'celebrate' && '🎉'}
                                                {type === 'support' && '💪'}
                                                {` ${activity.reactions?.filter(r => r.type === type).length || 0}`}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Comments */}
                                {activity.comments?.length > 0 && (
                                    <div className="px-4 py-3 space-y-3">
                                        {activity.comments.map((comment, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center">
                                                    <span className="text-white text-sm">
                                                        {comment.user.profile?.fullName?.charAt(0) || comment.user.email.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 bg-black/20 rounded-lg p-3">
                                                    <p className="text-white text-sm">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Comment */}
                                <div className="p-4 border-t border-orange-500/20">
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const comment = e.target.comment.value;
                                        if (comment.trim()) {
                                            handleComment(activity._id, comment);
                                            e.target.comment.value = '';
                                        }
                                    }}>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="comment"
                                                placeholder="Add a comment..."
                                                className="flex-1 bg-black/40 border border-orange-500/20 rounded-lg px-4 py-2 
                                text-white focus:outline-none focus:border-orange-500"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="submit"
                                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                                            >
                                                Post
                                            </motion.button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;