import { useState, useEffect } from 'react';

const ActivityList = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({
        type: 'all',
        startDate: '',
        endDate: ''
    });

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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [filter]);

    if (loading) {
        return <div className="text-center">Loading activities...</div>;
    }

    if (error) {
        return <div className="text-red-600">Error: {error}</div>;
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4 flex gap-4">
                <select
                    value={filter.type}
                    onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="all">All Activities</option>
                    <option value="running">Running</option>
                    <option value="walking">Walking</option>
                    <option value="cycling">Cycling</option>
                    <option value="swimming">Swimming</option>
                    <option value="weightlifting">Weightlifting</option>
                    <option value="yoga">Yoga</option>
                    <option value="other">Other</option>
                </select>

                <input
                    type="date"
                    value={filter.startDate}
                    onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                    type="date"
                    value={filter.endDate}
                    onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activities.map((activity) => (
                            <tr key={activity._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(activity.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize">
                                    {activity.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {activity.duration} min
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {activity.distance ? `${activity.distance} km` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {activity.calories ? `${activity.calories} kcal` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityList;