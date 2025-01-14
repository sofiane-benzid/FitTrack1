import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socialService } from '../../../services/socialService';
import Feedback from '../../common/Feedback';

import PropTypes from 'prop-types';

const SearchResult = ({ user, onSendRequest }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group relative bg-black/40 border border-orange-500/20 rounded-xl overflow-hidden hover:bg-black/60 transition-colors"
    >
        <div className="p-6">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform">
                        <span className="text-white font-bold text-2xl">
                            {user.fullName?.charAt(0) || user.email.charAt(0)}
                        </span>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500/30 rounded-full" />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                        {user.fullName || 'No name set'}
                    </h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSendRequest(user._id)}
                    className="relative px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-medium group-hover:from-red-600 group-hover:to-orange-600 transition-all"
                >
                    Add Friend
                    <motion.div
                        className="absolute inset-0 bg-white/20 rounded-lg"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                    />
                </motion.button>
            </div>
        </div>
    </motion.div>
);

const UserSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const  setError = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Keep existing fetch logic
    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        try {
            const allUsers = await socialService.searchUsers('');
            setUsers(allUsers);
        } catch (err) {
            setError('Failed to load users' + err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setIsSearching(true);

        // Filter users locally based on search term
        if (searchTerm.trim()) {
            const filteredUsers = users.filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setUsers(filteredUsers);
        } else {
            // If search is empty, fetch all users again
            fetchAllUsers();
        }

        setTimeout(() => setIsSearching(false), 500);
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {feedback && (
                <Feedback
                    type={feedback.type}
                    message={feedback.message}
                    onClose={() => setFeedback(null)}
                />
            )}

            <motion.div
                layout
                className="bg-black/40 rounded-xl border border-orange-500/20 overflow-hidden"
            >
                {/* Search Header */}
                <div className="p-6 border-b border-orange-500/20">
                    <form onSubmit={handleSearch} className="relative">
                        <motion.div
                            animate={isSearching ? { rotate: 360 } : { rotate: 0 }}
                            className="absolute left-4 top-1/3 -translate-y-1/2 text-orange-500"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </motion.div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-orange-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50"
                        />
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="absolute right-4 top-2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-orange-600"
                        >
                            Search
                        </motion.button>
                    </form>
                </div>

                {/* Results Section */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <p className="text-gray-400">No users found</p>
                            {searchTerm && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={fetchAllUsers}
                                    className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 rounded-lg text-sm hover:from-red-500/30 hover:to-orange-500/30"
                                >
                                    Show all users
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <motion.div layout className="grid gap-4">
                                <AnimatePresence mode="popLayout">
                                    {users.map(user => (
                                        <SearchResult
                                            key={user._id}
                                            user={user}
                                            onSendRequest={handleSendRequest}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );}
SearchResult.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        fullName: PropTypes.string,
        email: PropTypes.string.isRequired,
    }).isRequired,
    onSendRequest: PropTypes.func.isRequired,
};

export default UserSearch;

