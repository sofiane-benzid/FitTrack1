import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Feedback from '../../common/Feedback';
import { useAuth } from '../../../hooks/useAuth';

const PartnerSelection = ({ onPartnerSelect }) => {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [partnerships, setPartnerships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);

    const fetchFriendsAndPartnerships = async () => {
        try {
            setLoading(true);
            
            const [friendsRes, partnershipsRes] = await Promise.all([
                fetch('http://localhost:5000/social/friends', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch('http://localhost:5000/partnerships', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            if (!friendsRes.ok || !partnershipsRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const [friendsData, partnershipsData] = await Promise.all([
                friendsRes.json(),
                partnershipsRes.json()
            ]);

            // Ensure we handle the data structure correctly
            setFriends(friendsData || []);
            setPartnerships(partnershipsData || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setFeedback({
                type: 'error',
                message: 'Failed to load friends and partnerships'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriendsAndPartnerships();
    }, []);

    const handleCreatePartnership = async (friendId) => {
        try {
            setLoading(true);
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

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create partnership');
            }

            const data = await response.json();
            setPartnerships(prev => [...prev, data.partnership]);
            onPartnerSelect(friendId);
            setFeedback({
                type: 'success',
                message: 'Partnership created successfully!'
            });

        } catch (err) {
            console.error('Error creating partnership:', err);
            setFeedback({
                type: 'error',
                message: err.message || 'Failed to create partnership'
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper function to check if a friend is already a partner
    const isAlreadyPartner = (friendId) => {
        return partnerships.some(partnership => 
            partnership.partners.some(p => p._id === friendId)
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
                        {partnerships.length === 0 ? (
                            <p className="text-orange-200/70 text-center col-span-2">No active partnerships</p>
                        ) : (
                            partnerships.map(partnership => {
                                // Find the partner (excluding current user)
                                const partner = partnership.partners?.find(p => p._id !== user?.id);
                                
                                return (
                                    <motion.div
                                        key={partnership._id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => onPartnerSelect(partner?._id)}
                                        className="bg-black/40 p-4 rounded-lg border border-orange-500/10 cursor-pointer 
                                                 hover:border-orange-500/30 transition-all duration-300"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold">
                                                    {partner?.profile?.fullName?.[0] || partner?.email?.[0] || 'P'}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium">
                                                    {partner?.profile?.fullName || partner?.email || 'Partner'}
                                                </h4>
                                                <p className="text-sm text-orange-200/70">
                                                    Active since {new Date(partnership.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            
                                            {/* Visual indicator that it's clickable */}
                                            <div className="ml-auto">
                                                <motion.div
                                                    whileHover={{ x: 5 }}
                                                    className="text-orange-400"
                                                >
                                                    <svg 
                                                        className="w-6 h-6" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                            strokeWidth={2} 
                                                            d="M9 5l7 7-7 7" 
                                                        />
                                                    </svg>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

            {/* Available Friends */}
            <div className="bg-black/60 p-6 rounded-xl border border-orange-500/20">
                <h3 className="text-lg font-medium text-white mb-4">Available Friends</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.length === 0 ? (
                        <p className="text-orange-200/70 text-center col-span-2">
                            No friends available for partnership
                        </p>
                    ) : (
                        friends
                            // Filter out friends who are already partners
                            .filter(friend => !isAlreadyPartner(friend._id))
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
                                                {friend.fullName?.[0] || friend.email?.[0] || 'F'}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">
                                                {friend.fullName || friend.email}
                                            </h4>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCreatePartnership(friend._id)}
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                                        disabled={loading}
                                    >
                                        Add Partner
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

PartnerSelection.propTypes = {
    onPartnerSelect: PropTypes.func.isRequired
};

export default PartnerSelection;