import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import Feedback from '../../common/Feedback';
import { API_BASE_URL } from '../../../../../server/config/env';

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/activity/feed`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch activity feed');
            const data = await response.json();
            setActivities(data);
        } catch (err) {
            setFeedback({
                type: 'error',
                message: 'Error loading activity feed: ' + err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleComment = async (activityId, comment) => {
        try {
            const response = await fetch(`${API_BASE_URL}/activity/${activityId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content: comment })
            });
    
            if (!response.ok) throw new Error('Failed to add comment');
    
            const { activity: updatedActivity } = await response.json();
    
            // Find the existing activity to get its populated user data
            const existingActivity = activities.find(a => a._id === activityId);
            
            if (!existingActivity) {
                throw new Error('Activity not found');
            }
    
            // Merge the updated activity with existing user data
            const mergedActivity = {
                ...updatedActivity,
                user: existingActivity.user // Keep the existing populated user data
            };
    
            setActivities(prev =>
                prev.map(activity =>
                    activity._id === activityId 
                        ? mergedActivity
                        : activity
                )
            );
    
            setFeedback({
                type: 'success',
                message: 'Comment added successfully!'
            });
        } catch (err) {
            console.error('Comment error:', err);
            setFeedback({
                type: 'error',
                message: err.message
            });
        }
    };
    
    const handleReaction = async (activityId, type) => {
        try {
            const response = await fetch(`${API_BASE_URL}/activity/${activityId}/react`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ type })
            });
    
            if (!response.ok) throw new Error('Failed to add reaction');
    
            const { activity: updatedActivity } = await response.json();
    
            // Find the existing activity to get its populated user data
            const existingActivity = activities.find(a => a._id === activityId);
            
            if (!existingActivity) {
                throw new Error('Activity not found');
            }
    
            // Merge the updated activity with existing user data
            const mergedActivity = {
                ...updatedActivity,
                user: existingActivity.user // Keep the existing populated user data
            };
    
            setActivities(prev =>
                prev.map(activity =>
                    activity._id === activityId 
                        ? mergedActivity
                        : activity
                )
            );
    
            setFeedback({
                type: 'success',
                message: 'Reaction added!'
            });
        } catch (err) {
            console.error('Reaction error:', err);
            setFeedback({
                type: 'error',
                message: err.message
            });
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Just now'; // Fallback for undefined dates

        try {
            return new Date(date).toLocaleString();
        } catch (error) {
            console.error('Invalid date:', error);
            console.error('Invalid date:', date);
            return 'Just now';
        }
    };

    const renderActivity = (activity) => {
        if (!activity || !activity._id) {
            console.error('Invalid activity data:', activity);
            return null;
        }

        const userReaction = activity.reactions?.find(
            r => r.user?._id === user?.id
        )?.type;


        return (
            <motion.div
                key={activity._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/60 rounded-xl border border-orange-500/20 overflow-hidden mb-4"
            >
                {/* Activity Header */}
                <div className="p-4 border-b border-orange-500/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                            <span className="text-white font-bold">
                                {activity.user?.profile?.fullName?.[0] || activity.user?.email?.[0] || '?'}
                            </span>
                        </div>
                        <div>
                            <p className="text-white font-medium">
                                {activity.user?.profile?.fullName || activity.user?.email || 'Unknown User'}
                            </p>
                            <p className="text-sm text-orange-200/70">
                                {new Date(activity.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Activity Content */}
                    <div className="mt-3">
                        <p className="text-white">
                            {activity.type} - {activity.duration} minutes
                            {activity.distance && ` - ${activity.distance}km`}
                            {activity.calories && ` - ${activity.calories} calories`}
                        </p>
                        {activity.notes && (
                            <p className="text-orange-200/70 mt-2">{activity.notes}</p>
                        )}
                    </div>
                </div>

                {/* Reactions */}
                <div className="p-3 bg-black/40 border-b border-orange-500/20">
                    <div className="flex gap-2">
                        {['like', 'celebrate', 'support'].map((type) => (
                            <motion.button
                                key={`${activity._id}-${type}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleReaction(activity._id, type)}
                                className={`px-3 py-1 rounded-full text-sm ${userReaction === type
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                    : 'bg-black/40 text-orange-200 hover:bg-black/60'
                                    }`}
                            >
                                {type === 'like' && '👍'}
                                {type === 'celebrate' && '🎉'}
                                {type === 'support' && '💪'}
                                <span className="ml-1">
                                    {activity.reactions?.filter(r => r.type === type).length || 0}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Comments */}
                <div className="p-4">
                    {Array.isArray(activity.comments) && activity.comments.map((comment) => {
                        // Skip invalid comments
                        if (!comment || !comment.content) return null;

                        return (
                            <div
                                key={comment._id || `${activity._id}-${Date.now()}-${Math.random()}`}
                                className="flex items-start gap-3 mb-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center">
                                    <span className="text-white text-sm">
                                        {comment.user?.profile?.fullName?.[0] || comment.user?.email?.[0] || '?'}
                                    </span>
                                </div>
                                <div className="flex-1 bg-black/40 rounded-lg p-3">
                                    <p className="text-sm text-white">{comment.content}</p>
                                    <p className="text-xs text-orange-200/50 mt-1">
                                        {formatDate(comment.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* Comment Input */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const comment = e.target.comment.value;
                            if (comment.trim()) {
                                handleComment(activity._id, comment);
                                e.target.comment.value = '';
                            }
                        }}
                        className="mt-3"
                    >
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
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
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
                    <p className="text-orange-200">No activities in your feed yet</p>
                    <p className="text-sm text-orange-200/70 mt-2">
                        Start tracking activities or follow more friends to see their updates
                    </p>
                </motion.div>
            ) : (
                activities.map(activity => (
                    <motion.div key={activity._id}>
                        {renderActivity(activity)}
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default ActivityFeed;