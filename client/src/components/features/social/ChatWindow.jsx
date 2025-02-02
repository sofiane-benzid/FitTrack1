import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Feedback from '../../common/Feedback';
import { useAuth } from '../../../hooks/useAuth';

const ChatWindow = ({ chatId, onClose, partnerId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll for new messages
        return () => clearInterval(interval);
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:5000/chat/${chatId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data);
            setLoading(false);
        } catch (err) {
            setError('Error loading messages');
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch(`http://localhost:5000/chat/${chatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    content: newMessage,
                    recipientId: partnerId
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            setNewMessage('');
            fetchMessages(); // Refresh messages
        } catch (err) {
            console.error(err);
            setError('Failed to send message');
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-orange-500/20 flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Chat</h3>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="text-orange-200 hover:text-orange-300"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </motion.button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"/>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={message._id || index}
                                initial={{ opacity: 0, x: message.sender === user.id ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex ${message.sender === user.id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                        message.sender === user.id
                                            ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-200'
                                            : 'bg-black/40 text-white'
                                    }`}
                                >
                                    <p>{message.content}</p>
                                    <p className="text-xs mt-1 opacity-50">
                                        {new Date(message.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-orange-500/20">
                {error && <Feedback type="error" message={error} onClose={() => setError(null)} />}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-black/40 border border-orange-500/20 rounded-lg px-4 py-2 
                                 text-white focus:outline-none focus:border-orange-500"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                    >
                        Send
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

ChatWindow.propTypes = {
    chatId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    partnerId: PropTypes.string.isRequired
};

export default ChatWindow;