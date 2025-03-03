import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { socialService } from '../../../services/socialService';
import Feedback from '../../common/Feedback';

import PropTypes from 'prop-types';

const RequestCard = ({ request, onAccept, onDecline }) => (

    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-black/40 rounded-xl border border-blue-500/20 overflow-hidden"
    >
        <div className="p-4">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">
                            {request.requester.fullName?.charAt(0) || request.requester.email.charAt(0)}
                        </span>
                    </div>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                        <span className="text-white text-xs">+</span>
                    </motion.div>
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-semibold">
                        {request.requester.fullName || 'No name set'}
                    </h3>
                    <p className="text-gray-400 text-sm">{request.requester.email}</p>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAccept(request._id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 font-medium"
                    >
                        Accept Request
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onDecline(request._id)}
                        className="px-4 py-2 bg-black/40 text-gray-300 rounded-lg hover:bg-black/60 border border-blue-500/20 font-medium"
                    >
                        Decline
                    </motion.button>
                </div>
            </div>
        </div>
    </motion.div>
);

const SentRequestCard = ({ request, onCancel }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-black/40 rounded-xl border border-blue-500/20 overflow-hidden"
    >
        <div className="p-4">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/40 to-blue-500/40 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                            {request.recipient.fullName?.charAt(0) || request.recipient.email.charAt(0)}
                        </span>
                    </div>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500/50 rounded-full flex items-center justify-center"
                    >
                        <span className="text-white text-xs">→</span>
                    </motion.div>
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-semibold">
                        {request.recipient.fullName || 'No name set'}
                    </h3>
                    <p className="text-gray-400 text-sm">{request.recipient.email}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCancel(request._id)}
                    className="text-blue-500 hover:text-blue-400"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </motion.button>
            </div>
        </div>
    </motion.div>
);

RequestCard.propTypes = {
    request: PropTypes.object.isRequired,
    onAccept: PropTypes.func.isRequired,
    onDecline: PropTypes.func.isRequired,
};

SentRequestCard.propTypes = {
    request: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
};

const FriendRequests = () => {
    const [requests, setRequests] = useState({
        received: [],
        sent: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [activeTab, setActiveTab] = useState('received');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await socialService.getFriendRequests();
            setRequests(data);
        } catch (err) {
            setError('Failed to load friend requests');
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (requestId, accept) => {
        try {
            await socialService.respondToFriendRequest(requestId, accept);
            setFeedback({
                type: 'success',
                message: `Friend request ${accept ? 'accepted' : 'declined'}`
            });
            fetchRequests();
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.message || 'Failed to respond to request'
            });
        }
    };

    const handleCancelRequest = async (requestId) => {
        try {
            await socialService.cancelFriendRequest(requestId);
            setFeedback({
                type: 'success',
                message: 'Friend request cancelled'
            });
            fetchRequests();
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.message || 'Failed to cancel request'
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-[200px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return <Feedback type="error" message={error} />;
    }

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

            <div className="bg-black/40 rounded-xl border border-blue-500/20 overflow-hidden">
                <div className="p-4 border-b border-blue-500/20">
                    <div className="flex gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('received')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'received'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Received ({requests.received.length})
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('sent')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'sent'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Sent ({requests.sent.length})
                        </motion.button>
                    </div>
                </div>

                <div className="p-4">
                    <AnimatePresence mode="wait">
                        {activeTab === 'received' ? (
                            <motion.div
                                key="received"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                {requests.received.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400">No pending friend requests</p>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {requests.received.map(request => (
                                            <RequestCard
                                                key={request._id}
                                                request={request}
                                                onAccept={() => handleRequest(request._id, true)}
                                                onDecline={() => handleRequest(request._id, false)}
                                            />
                                        ))}
                                    </AnimatePresence>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="sent"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                {requests.sent.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400">No sent friend requests</p>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {requests.sent.map(request => (
                                            <SentRequestCard
                                                key={request._id}
                                                request={request}
                                                onCancel={() => handleCancelRequest(request._id)}
                                            />
                                        ))}
                                    </AnimatePresence>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default FriendRequests;