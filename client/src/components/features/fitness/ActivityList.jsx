import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const ActivityList = ({ onError }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [setFeedback] = useState(null);
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

    const fetchActivities = async () => {
        try {
            let url = 'http://localhost:5000/activity/list';
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [filter]);

    const handleDelete = async (activityId) => {
        if (!window.confirm('Are you sure you want to delete this activity?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/activity/${activityId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete activity');
            }

            setActivities(prev => prev.filter(activity => activity._id !== activityId));
        } catch (error) {
            onError?.(error);
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


    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Loading activities...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* Filters */}
            <div className="bg-black/20 p-4 rounded-lg border border-red-500/10">
                <h2 className="text-lg font-medium text-orange-200 mb-4">Activity Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-orange-200/70 mb-1">Activity Type</label>
                        <select
                            value={filter.type}
                            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                     focus:border-red-500/50 focus:ring-0 transition-colors"
                        >
                            {activityTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-orange-200/70 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filter.startDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                     focus:border-red-500/50 focus:ring-0 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-orange-200/70 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filter.endDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                     focus:border-red-500/50 focus:ring-0 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Activities List */}
            {activities.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-orange-200/70">No activities found</p>
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
                                className="bg-black/20 rounded-lg border border-red-500/10 overflow-hidden"
                            >
                                {/* Activity Header */}
                                <div
                                    onClick={() => setExpandedActivity(expandedActivity === activity._id ? null : activity._id)}
                                    className="p-4 cursor-pointer hover:bg-black/30 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg">
                                                <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {activity.type === 'running' && (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    )}
                                                    {activity.type === 'walking' && (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M13 4v16M7 12h14m-7 4l4-4-4-4" />
                                                    )}
                                                    {activity.type === 'cycling' && (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 0v1m0 3v1m3-3h1m-7 0H7m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    )}
                                                    {activity.type === 'swimming' && (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M4 10c2.667-4 8-4 10.667 0 2.667 4 8 4 10.667 0M4 18c2.667-4 8-4 10.667 0 2.667 4 8 4 10.667 0" />
                                                    )}
                                                    {activity.type === 'weightlifting' && (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zm4-2v16m10-16v16" />
                                                    )}
                                                    {activity.type === 'yoga' && (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M12 4a4 4 0 100 8 4 4 0 000-8zm-8 8h16m-8-4v12m-4 0l4-4 4 4" />
                                                    )}
                                                    {activity.type === 'other' && (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                    )}
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-orange-200 capitalize">
                                                    {activity.type}
                                                </h3>
                                                <p className="text-orange-200/70">
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-orange-200/70">
                                                {activity.duration} minutes
                                            </span>
                                            <svg
                                                className={`w-5 h-5 text-orange-200/70 transform transition-transform 
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
                                            <div className="px-4 py-3 bg-black/10 border-t border-red-500/10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <p className="text-orange-200/70">Duration: {activity.duration} minutes</p>
                                                        {activity.distance && (
                                                            <p className="text-orange-200/70">Distance: {activity.distance} km</p>
                                                        )}
                                                        {activity.calories && (
                                                            <p className="text-orange-200/70">Calories: {activity.calories} kcal</p>
                                                        )}
                                                    </div>

                                                    {activity.sets && activity.sets.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-orange-200">Sets:</p>
                                                            {activity.sets.map((set, index) => (
                                                                <div key={index} className="flex justify-between bg-black/20 p-2 rounded">
                                                                    <span className="text-orange-200">{set.exercise}</span>
                                                                    <span className="text-orange-200/70">{set.weight}kg × {set.reps}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {activity.notes && (
                                                        <div className="col-span-2">
                                                            <p className="text-orange-200">Notes:</p>
                                                            <p className="text-orange-200/70 mt-1">{activity.notes}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-end mt-4">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDelete(activity._id)}
                                                        className="text-red-400 hover:text-red-300 transition-colors"
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
    onError: PropTypes.func
};

export default ActivityList;