import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Feedback from '../../common/Feedback';

const PartnerSelection = ({ onPartnerSelect }) => {
    const [friends, setFriends] = useState([]);
    const [partnerships, setPartnerships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        fetchFriendsAndPartnerships();
    }, []);

    const fetchFriendsAndPartnerships = async () => {
        try {
            const [friendsRes, partnershipsRes] = await Promise.all([
                fetch('http://localhost:5000/social/friends', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch('http://localhost:5000/partnerships', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            const [friendsData, partnershipsData] = await Promise.all([
                friendsRes.json(),
                partnershipsRes.json()
            ]);

            setFriends(friendsData);
            setPartnerships(partnershipsData);
        } catch (err) {
            console.error('Error fetching friends and partnerships:', err);
            setFeedback({
                type: 'error',
                message: 'Failed to load friends and partnerships'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePartnership = async (friendId) => {
        try {
            const response = await fetch('http://localhost:5000/partnerships/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    partnerId: friendId,
                    reminderPreferences: {
                        enabled: true,
                        frequency: 'daily',
                        time: '09:00'
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to create partnership');

            const newPartnership = await response.json();
            setPartnerships(prev => [...prev, newPartnership]);
            setFeedback({
                type: 'success',
                message: 'Partnership created successfully!'
            });
            onPartnerSelect(friendId);
        } catch (err) {
            console.error('Error creating partnership:', err);
            setFeedback({
                type: 'error',
                message: 'Failed to create partnership'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
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

            {/* Active Partnerships */}
            <div className="bg-black/60 p-6 rounded-xl border border-orange-500/20">
                <h3 className="text-lg font-medium text-white mb-4">Active Partnerships</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partnerships.map(partnership => (
                        <motion.div
                            key={partnership._id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => onPartnerSelect(partnership.partnerId)}
                            className="bg-black/40 p-4 rounded-lg border border-orange-500/10 cursor-pointer"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">
                                        {partnership.partner.profile?.fullName?.charAt(0) || 'P'}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">
                                        {partnership.partner.profile?.fullName || 'Partner'}
                                    </h4>
                                    <p className="text-sm text-orange-200/70">
                                        Active since {new Date(partnership.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {partnerships.length === 0 && (
                    <p className="text-center text-orange-200/70 py-4">No active partnerships</p>
                )}
            </div>

            {/* Available Friends */}
            <div className="bg-black/60 p-6 rounded-xl border border-orange-500/20">
                <h3 className="text-lg font-medium text-white mb-4">Available Friends</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends
                        .filter(friend => !partnerships.some(p => p.partnerId === friend._id))
                        .map(friend => (
                            <motion.div
                                key={friend._id}
                                whileHover={{ scale: 1.02 }}
                                className="bg-black/40 p-4 rounded-lg border border-orange-500/10"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">
                                                {friend.profile?.fullName?.charAt(0) || 'F'}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">
                                                {friend.profile?.fullName || friend.email}
                                            </h4>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCreatePartnership(friend._id)}
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                                    >
                                        Add Partner
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                </div>
                {friends.length === 0 && (
                    <p className="text-center text-orange-200/70 py-4">
                        No friends available for partnership
                    </p>
                )}
            </div>
        </div>
    );
};
PartnerSelection.propTypes = {
    onPartnerSelect: PropTypes.func.isRequired,
};

export default PartnerSelection;