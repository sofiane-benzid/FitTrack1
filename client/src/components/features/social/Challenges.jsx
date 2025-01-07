import { useState, useEffect } from 'react';
import { socialService } from '../../../services/socialService';
import Feedback from '../../common/Feedback';

const Challenge = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target: '',
        endDate: '',
        participantIds: []
    });

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const data = await socialService.getChallenges();
            setChallenges(data);
        } catch (err) {
            setError('Failed to load challenges');
            console.error('Error fetching challenges:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await socialService.createChallenge(formData);
            setShowCreateForm(false);
            setFormData({
                title: '',
                description: '',
                target: '',
                endDate: '',
                participantIds: []
            });
            fetchChallenges();
        } catch (err) {
            setError('Failed to create challenge'+err);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && <Feedback type="error" message={error} />}

            {/* Create Challenge Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Create Challenge
                </button>
            </div>

            {/* Create Challenge Form */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Challenge</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target (number)</label>
                                <input
                                    type="number"
                                    value={formData.target}
                                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Challenges List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Active Challenges</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                    {challenges.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">
                            No active challenges
                        </li>
                    ) : (
                        challenges.map((challenge) => (
                            <li
                                key={challenge._id}
                                className="p-4 hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">{challenge.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                                        <div className="mt-2 text-sm text-gray-500">
                                            Target: {challenge.target} | Ends: {new Date(challenge.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {challenge.participants.length} participants
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3">
                                    <div className="relative pt-1">
                                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                            <div
                                                style={{ width: `${(challenge.currentProgress / challenge.target) * 100}%` }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Challenge;