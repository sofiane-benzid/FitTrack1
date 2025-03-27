import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../../../server/config/env';
import Feedback from '../../common/Feedback';

// Using simple activity emoji icons instead of SVGs to reduce token usage
const activityEmojis = {
    running: '🏃',
    walking: '🚶',
    cycling: '🚴',
    swimming: '🏊',
    weightlifting: '🏋️',
    yoga: '🧘',
    other: '💪'
};

const ActivityList = ({ onError, refreshTrigger }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);
    const [expandedActivity, setExpandedActivity] = useState(null);
    const [filter, setFilter] = useState({
        type: 'all',
        startDate: '',
        endDate: ''
    });

    const activityTypes = [
        { value: 'all', label: 'All Activities' },
        { value: 'running', label: 'Running' },
        { value: 'walking', label: 'Walking' },
        { value: 'cycling', label: 'Cycling' },
        { value: 'swimming', label: 'Swimming' },
        { value: 'weightlifting', label: 'Weight Training' },
        { value: 'yoga', label: 'Yoga' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        fetchActivities();
    }, [filter, refreshTrigger]);

    // Format duration in HH:MM:SS format
    const formatDuration = (minutes) => {
        const totalSeconds = Math.round(minutes * 60);
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        const formattedHours = hours > 0 ? `${hours}h ` : '';
        const formattedMins = mins > 0 ? `${mins}m ` : '';
        const formattedSecs = secs > 0 ? `${secs}s` : '';

        return `${formattedHours}${formattedMins}${formattedSecs}`;
    };

    const fetchActivities = async () => {
        try {
            let url = `${API_BASE_URL}/activity/list`;
            const queryParams = [];

            if (filter.type !== 'all') {
                queryParams.push(`type=${filter.type}`);
            }
            if (filter.startDate) {
                queryParams.push(`startDate=${filter.startDate}`);
            }
            if (filter.endDate) {
                queryParams.push(`endDate=${filter.endDate}`);
            }

            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }

            const data = await response.json();
            setActivities(data);
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.message || 'Failed to fetch activities'
            });

            // Auto-dismiss feedback after 3 seconds
            setTimeout(() => {
                setFeedback(null);
            }, 3000);

            if (onError) onError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (activityId) => {
        if (!window.confirm('Are you sure you want to delete this activity?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/activity/${activityId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete activity');
            }

            setActivities(prev => prev.filter(activity => activity._id !== activityId));

            setFeedback({
                type: 'success',
                message: 'Activity deleted successfully'
            });

            // Auto-dismiss feedback after 3 seconds
            setTimeout(() => {
                setFeedback(null);
            }, 3000);
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error.message || 'Failed to delete activity'
            });

            // Auto-dismiss feedback after 3 seconds
            setTimeout(() => {
                setFeedback(null);
            }, 3000);

            if (onError) onError(error);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-32 bg-black/20 rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Feedback message */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4"
                    >
                        <Feedback
                            type={feedback.type}
                            message={feedback.message}
                            onClose={() => setFeedback(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-black/20 p-4 rounded-lg border border-blue-500/10">
                <h2 className="text-lg font-medium text-blue-200 mb-4">Activity Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-blue-200/70 mb-1">Activity Type</label>
                        <select
                            value={filter.type}
                            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full bg-black/20 border border-blue-500/20 rounded-lg text-blue-200
                     focus:border-blue-500/50 focus:ring-0 transition-colors"
                        >
                            {activityTypes.map(type => (
                                <option className="bg-black text-white" key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-200/70 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filter.startDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full bg-black/20 border border-blue-500/20 rounded-lg text-blue-200
                            focus:border-blue-500/50 focus:ring-0 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-200/70 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filter.endDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full bg-black/20 border border-blue-500/20 rounded-lg text-blue-200
                     focus:border-blue-500/50 focus:ring-0 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Activities List */}
            {activities.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-blue-200/70">No activities found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {activities.map((activity) => (
                            <motion.div
                                key={activity._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-black/20 rounded-lg border border-blue-500/10 overflow-hidden"
                            >
                                {/* Activity Header */}
                                <div
                                    onClick={() => setExpandedActivity(expandedActivity === activity._id ? null : activity._id)}
                                    className="p-4 cursor-pointer hover:bg-black/30 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-lg w-10 h-10 flex items-center justify-center text-xl">
                                                {activityEmojis[activity.type] || activityEmojis.other}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-blue-200 capitalize">
                                                    {activity.type}
                                                </h3>
                                                <p className="text-blue-200/70">
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-blue-200/70">
                                                {formatDuration(activity.duration)}
                                            </span>
                                            <svg
                                                className={`w-5 h-5 text-blue-200/70 transform transition-transform 
                                ${expandedActivity === activity._id ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedActivity === activity._id && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 py-3 bg-black/10 border-t border-blue-500/10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <p className="text-blue-200/70">Duration: {formatDuration(activity.duration)}</p>
                                                        {activity.distance && (
                                                            <p className="text-blue-200/70">Distance: {activity.distance} km</p>
                                                        )}
                                                        {activity.calories && (
                                                            <p className="text-blue-200/70">Calories: {activity.calories} kcal</p>
                                                        )}
                                                    </div>

                                                    {activity.sets && activity.sets.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-blue-200">Sets:</p>
                                                            {activity.sets.map((set, index) => (
                                                                <div key={index} className="flex justify-between bg-black/20 p-2 rounded">
                                                                    <span className="text-blue-200">{set.exercise}</span>
                                                                    <span className="text-blue-200/70">{set.weight}kg × {set.reps}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {activity.notes && (
                                                        <div className="col-span-2">
                                                            <p className="text-blue-200">Notes:</p>
                                                            <p className="text-blue-200/70 mt-1">{activity.notes}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-end mt-4">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDelete(activity._id)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                    >
                                                        Delete Activity
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

ActivityList.propTypes = {
    onError: PropTypes.func,
    refreshTrigger: PropTypes.any
};

export default ActivityList;