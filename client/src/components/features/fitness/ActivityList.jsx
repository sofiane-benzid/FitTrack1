import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const activityIcons = {
    running: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
            <path d="M15.6205 5.53997C15.6205 6.35551 14.9593 7.01665 14.1438 7.01665C13.3282 7.01665 12.6671 6.35551 12.6671 5.53997C12.6671 4.72442 13.3282 4.06328 14.1438 4.06328C14.9593 4.06328 15.6205 4.72442 15.6205 5.53997Z" fill="#f9f5f5" stroke="#f9f5f5" strokeWidth="1.26573"></path>
            <path d="M12.0933 9.23584C12.8705 9.23584 13.862 10.0475 13.862 10.0475C12.8953 12.1133 12.0933 12.8251 12.0933 14.4691H9.94097C11.6266 10.9973 11.1466 11.1017 12.0933 9.23584Z" fill="#f9f5f5"></path>
            <path d="M9.94097 14.4691C8.64019 16.7679 5.86951 20.0585 5.86951 20.0585M9.94097 14.4691C10.6347 14.4691 11.3996 14.4691 12.0933 14.4691M9.94097 14.4691C11.6266 10.9973 11.1466 11.1017 12.0933 9.23584C12.8705 9.23584 13.862 10.0475 13.862 10.0475C12.8953 12.1133 12.0933 12.8251 12.0933 14.4691M12.0933 14.4691C13.4374 16.7679 11.4221 20.5695 11.4221 20.5695" stroke="#f9f5f5" strokeWidth="2.21502" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M14.0381 10.0635L14.9763 13.9662L18.1305 11.9881" stroke="#f9f5f5" strokeWidth="1.91969" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M12.0342 9.05542L9.18264 9.02772L7.54512 12.0129" stroke="#f9f5f5" strokeWidth="1.91969" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
    ),
    walking: (
        <svg fill="#ffffff" viewBox="-8 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.5 7.063c0-1.25-1.031-2.281-2.313-2.281-1.25 0-2.25 1.031-2.25 2.281 0 1.281 1 2.281 2.25 2.281 1.281 0 2.313-1 2.313-2.281zM7.031 27.188h-2.031s-0.094-5.781 0.063-6.469c0.125-0.688 1.469-2.125 1.531-2.688 0.063-0.594-0.531-3.031-0.531-3.031s-1.344 1.219-1.781 1.438-3.875 0.781-3.875 0.781l-0.406-1.75s3.281-0.719 3.75-1.094c0.469-0.344 1.719-3.375 2.656-3.75 0.625-0.281 2.313-0.156 3.156-0.156 0.875 0 3.75 1.656 4.031 2.031 0.313 0.344 2.031 3.719 2.031 3.719l-1.563 0.875-1.25-2.688s-0.969-0.813-1.344-0.938c-0.406-0.125-0.938-0.281-1.031 0.063-0.125 0.313 0.719 2.875 0.938 3.594 0.188 0.75 1.219 4.156 1.594 4.875s2.594 3.906 2.594 3.906l-1.906 1.25s-2.719-3.688-3.063-4.219c-0.375-0.531-1.438-3.375-1.438-3.375s-1.813 2.219-1.969 2.906c-0.125 0.625-0.156 4.719-0.156 4.719z"></path>
        </svg>
    ),
    cycling: (
        <svg height="200px" width="200px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M127.576,298.397l23.806-108.109l-16.98-3.736L110.63,294.5c-4.415-0.62-8.889-1.044-13.473-1.044 C43.578,293.456,0,337.034,0,390.613c0,53.57,43.578,97.148,97.157,97.148c53.57,0,97.157-43.578,97.157-97.148 C194.314,347.662,166.28,311.199,127.576,298.397z M97.157,461.146c-38.892,0-70.524-31.642-70.524-70.533 c0-38.9,31.632-70.542,70.524-70.542c2.623,0,5.195,0.17,7.742,0.45l-14.688,66.703l16.98,3.736l14.61-66.356 c26.76,10.026,45.896,35.784,45.896,66.008C167.698,429.504,136.048,461.146,97.157,461.146z" fill="#ffffff"></path>
            <path d="M414.852,293.456c-49.623,0-90.594,37.406-96.384,85.492h-18.363v17.387h17.879 c2.989,50.905,45.225,91.426,96.868,91.426c53.57,0,97.148-43.578,97.148-97.148C512,337.034,468.422,293.456,414.852,293.456z M414.852,461.146c-36.964,0-67.324-28.594-70.252-64.811h68.52v-17.387h-67.765c5.586-33.356,34.578-58.877,69.497-58.877 c38.892,0,70.533,31.642,70.533,70.542C485.385,429.504,453.744,461.146,414.852,461.146z" fill="#ffffff"></path>
            <path d="M338.826,203.549l-14.084-72.358c-2.174-16.3-24.638-35.504-47.814-23.907l-109.739,56.287 c-7.064,2.691-10.595,10.595-7.887,17.65c2.692,7.072,10.596,10.612,17.642,7.922l78.242-23.177l11.028,42.338 c0,0-63.81,41.048-66.441,42.992c-13.142,9.746-22.71,31.446-9.934,47.593l55.744,68.342l-11.962,61.067 c-2.623,9.942,3.303,20.13,13.236,22.753c9.933,2.624,20.121-3.303,22.752-13.244l58.019-158.104 C336.11,260.465,346.433,233.23,338.826,203.549z M255.609,325.819l-21.096-31.277c-2.777-3.472-1.002-6.673,2.487-9.424 c3.481-2.767,28.602-14.458,28.602-14.458L255.609,325.819z" fill="#ffffff"></path>
            <path d="M274.295,93.089c18.983-1.808,32.906-18.652,31.09-37.618c-1.791-18.975-18.643-32.89-37.626-31.072 c-18.966,1.8-32.88,18.643-31.072,37.626C238.486,80.974,255.321,94.905,274.295,93.089z" fill="#ffffff"></path>
        </svg>
    ),
    swimming: (
        <svg fill="#fdfcfc" viewBox="0 -20.38 122.88 122.88" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,66.24c7.11-2.74,13.1-0.95,21.42,1.55c2.17,0.65,4.53,1.36,6.66,1.92c1.9,0.5,4.82-0.58,7.88-1.71 c3.82-1.41,7.8-2.87,12.57-2.75c3.6,0.09,6.63,1.74,9.69,3.41c1.92,1.05,3.87,2.11,4.95,2.15c1.24,0.04,3.08-1.04,4.92-2.12 c3-1.77,6-3.54,10.17-3.68c4.48-0.15,7.95,1.39,11.39,2.92c1.96,0.87,3.91,1.74,5.54,1.86c1.54,0.12,3.6-1.2,5.6-2.47 c2.78-1.78,5.51-3.52,9.1-3.92c4.27-0.47,8.93,1.54,12.89,3.24l0.1,0.05c0,4.05,0,8.11,0,12.16c-0.85-0.25-1.73-0.59-2.64-0.96 c-0.63-0.26-1.28-0.54-1.94-0.82c-2.71-1.16-5.9-2.54-7.17-2.4c-1.02,0.11-2.63,1.14-4.27,2.19c-0.6,0.38-1.21,0.77-1.82,1.15 c-3.04,1.85-6.34,3.43-10.69,3.1c-3.54-0.27-6.42-1.55-9.31-2.84l-0.25-0.11c-2.16-0.96-4.33-1.89-6.17-1.83 c-1.13,0.04-2.75,0.95-4.39,1.91l-0.38,0.22c-3.25,1.92-6.51,3.84-11.08,3.67c-3.73-0.14-6.87-1.84-9.96-3.53l-0.39-0.21 c-1.72-0.94-3.37-1.8-4.16-1.82c-2.42-0.06-5.21,0.91-7.92,1.91l-0.47,0.17c-4.74,1.75-9.26,3.41-14.62,2.01 c-2.88-0.75-5.06-1.41-7.06-2.01l-0.06-0.02c-7.25-2.18-11.98-3.58-17.65,0.13c-0.15,0.1-0.31,0.2-0.47,0.31v-0.31V66.24L0,66.24z M87.91,17.06l14.16-2.15c8.81-1.32,6.16-17.18-5.13-14.64l-32.11,5.3c-3.48,0.57-9.45,1.01-12.05,3.33 c-1.49,1.33-2.11,3.18-1.77,5.49c0.48,3.27,3.21,7.37,4.85,10.34l3.97,7.14c2.89,5.19,4.44,5.69-0.91,8.56L22.45,59.99l2.67,0.79 l8.01,0.12c0.91-0.3,1.86-0.65,2.83-1.01c3.82-1.41,7.8-2.87,12.57-2.75c3.6,0.09,6.63,1.74,9.69,3.41l1.38,0.74l7.06,0.11 c0.47-0.26,0.95-0.54,1.42-0.82c3-1.77,6-3.54,10.17-3.68c4.48-0.15,7.95,1.39,11.39,2.92c1.96,0.87,3.91,1.74,5.54,1.86 c0.37,0.03,0.77-0.03,1.19-0.14L77.79,28.5c-1.58-2.81-4.42-6.36-4.01-8.5c0.14-0.72,1.1-1.01,2.27-1.19 C80.01,18.24,83.95,17.66,87.91,17.06L87.91,17.06z" fill="#ffffff"></path>
        </svg>
    ),
    weightlifting: (
        <svg fill="#fcfcfc" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22,11H21V8a3,3,0,0,0-6,0v3H9V8A3,3,0,0,0,3,8v3H2a1,1,0,0,0,0,2H3v3a3,3,0,0,0,6,0V13h6v3a3,3,0,0,0,6,0V13h1a1,1,0,0,0,0-2ZM7,16a1,1,0,0,1-2,0V8A1,1,0,0,1,7,8Zm12,0a1,1,0,0,1-2,0V8a1,1,0,0,1,2,0Z"></path>
        </svg>
    ),
    yoga: (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="none" stroke="#fafafa" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12,11 L11,14 L12,17 L10.5,17 L9,14 L9.5,9.5 L12,11 Z M13,2 L9,6 L9,11 L9,14 L10,17 L6,17 L3,22 M20.5,22 L15.5,18.5 L12,17 L11,14 L12,11 L15.5,13 L15.5,18.5 M14,8.5 C13.4477153,8.5 13,8.05228475 13,7.5 C13,6.94771525 13.4477153,6.5 14,6.5 C14.5522847,6.5 15,6.94771525 15,7.5 C15,8.05228475 14.5522847,8.5 14,8.5 Z M11,10.5 L10,17 L10,13.5 L11,10.5 Z"></path>
        </svg>
    ),
    other: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    )
};


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

    useEffect(() => {
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
        fetchActivities();
    }, [filter, setFeedback]);

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
                                <option className="bg-black text-white" key={type.value} value={type.value}>{type.label}</option>
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
                                            <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg w-10 h-10 flex items-center justify-center">
                                                {activityIcons[activity.type]}
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