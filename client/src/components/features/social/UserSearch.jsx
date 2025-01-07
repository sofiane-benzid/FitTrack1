import { useState, useEffect } from 'react';
import { socialService } from '../../../services/socialService';
import Feedback from '../../common/Feedback';

const UserSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState(null);

    // Fetch all users initially
    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        try {
            const allUsers = await socialService.searchUsers('');
            setUsers(allUsers);
        } catch (err) {
            setError('Failed to load users'+ err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Filter users locally based on search term
        if (searchTerm.trim()) {
            const filteredUsers = users.filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setUsers(filteredUsers);
        } else {
            // If search is empty, fetch all users again
            fetchAllUsers();
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            await socialService.sendFriendRequest(userId);
            setFeedback({
                type: 'success',
                message: 'Friend request sent successfully!'
            });
            // Remove user from the list
            setUsers(users.filter(user => user._id !== userId));
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.message || 'Failed to send friend request'
            });
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
            {feedback && (
                <Feedback
                    type={feedback.type}
                    message={feedback.message}
                    onClose={() => setFeedback(null)}
                />
            )}

            {/* Search Form */}
            <div className="bg-white p-4 rounded-lg shadow">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users by name or email"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Users List */}
            {error ? (
                <Feedback type="error" message={error} />
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Users</h2>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <li className="p-4 text-center text-gray-500">
                                No users found
                            </li>
                        ) : (
                            users.map((user) => (
                                <li
                                    key={user._id}
                                    className="p-4 hover:bg-gray-50 flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 font-medium">
                                                    {user.fullName?.charAt(0) || user.email.charAt(0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-900">
                                                {user.fullName || 'No name set'}
                                            </p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSendRequest(user._id)}
                                        className="ml-4 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm font-medium"
                                    >
                                        Add Friend
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserSearch;