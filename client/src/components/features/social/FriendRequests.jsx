import { useState, useEffect } from 'react';
import { socialService } from '../../../services/socialService';
import Feedback from '../../common/Feedback';

const FriendRequests = () => {
    const [requests, setRequests] = useState({
        received: [],
        sent: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState(null);

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
            // Refresh the requests list
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
            // Refresh the requests list
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

    if (error) {
        return <Feedback type="error" message={error} />;
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

            {/* Received Requests */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Received Requests</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                    {requests.received.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">
                            No pending friend requests
                        </li>
                    ) : (
                        requests.received.map((request) => (
                            <li
                                key={request._id}
                                className="p-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 font-medium">
                                                    {request.requester.fullName?.charAt(0) || request.requester.email.charAt(0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-900">
                                                {request.requester.fullName || 'No name set'}
                                            </p>
                                            <p className="text-sm text-gray-500">{request.requester.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleRequest(request._id, true)}
                                            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleRequest(request._id, false)}
                                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Sent Requests */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Sent Requests</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                    {requests.sent.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">
                            No sent friend requests
                        </li>
                    ) : (
                        requests.sent.map((request) => (
                            <li
                                key={request._id}
                                className="p-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 font-medium">
                                                    {request.recipient.fullName?.charAt(0) || request.recipient.email.charAt(0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-900">
                                                {request.recipient.fullName || 'No name set'}
                                            </p>
                                            <p className="text-sm text-gray-500">{request.recipient.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCancelRequest(request._id)}
                                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                                    >
                                        Cancel Request
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default FriendRequests;