// src/components/features/fitness/ActivityList.jsx
import { useState, useEffect } from 'react';
import Feedback from '../../common/Feedback';

const ActivityList = () => {
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

    const renderActivityDetails = (activity) => {
        const isExpanded = expandedActivity === activity._id;

        return (
            <div className="border rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
                {/* Activity Header */}
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedActivity(isExpanded ? null : activity._id)}
                >
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium">
                                    {activity.type.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 capitalize">
                                {activity.type}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {new Date(activity.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600">
                            {activity.duration} min
                        </span>
                        <svg
                            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t px-4 py-3 bg-gray-50">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                                <dd className="mt-1 text-sm text-gray-900">{activity.duration} minutes</dd>
                            </div>

                            {activity.distance && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Distance</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{activity.distance} km</dd>
                                </div>
                            )}

                            {activity.calories && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Calories</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{activity.calories} kcal</dd>
                                </div>
                            )}

                            {activity.type === 'weightlifting' && activity.sets && activity.sets.length > 0 && (
                                <div className="col-span-2">
                                    <dt className="text-sm font-medium text-gray-500 mb-2">Sets</dt>
                                    <dd className="mt-1">
                                        <div className="space-y-2">
                                            {activity.sets.map((set, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-white p-2 rounded border text-sm flex justify-between items-center"
                                                >
                                                    <span className="font-medium">{set.exercise}</span>
                                                    <span className="text-gray-600">{set.weight}kg × {set.reps} reps</span>
                                                </div>
                                            ))}
                                        </div>
                                    </dd>
                                </div>
                            )}

                            {activity.notes && (
                                <div className="col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{activity.notes}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                )}
            </div>
        );
    };

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
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Activity Filters</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                        <select
                            value={filter.type}
                            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            {activityTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filter.startDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filter.endDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Activity List */}
            <div className="space-y-4">
                {feedback && (
                    <Feedback
                        type={feedback.type}
                        message={feedback.message}
                        onClose={() => setFeedback(null)}
                    />
                )}

                {activities.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">No activities found</p>
                    </div>
                ) : (
                    activities.map(activity => renderActivityDetails(activity))
                )}
            </div>
        </div>
    );
};

export default ActivityList;