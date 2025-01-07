import { useState, useEffect, useRef } from 'react';
import { socialService } from '../../../services/socialService';
import { useNavigate } from 'react-router-dom';

const NotificationsDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Handle clicking outside of dropdown to close it
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const fetchNotifications = async () => {
        try {
            const data = await socialService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await socialService.markNotificationAsRead(notification._id);
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            // Navigate based on notification type
            switch (notification.type) {
                case 'friend_request':
                    navigate('/social?tab=requests');
                    break;
                case 'challenge_invite':
                    navigate('/social?tab=challenges');
                    break;
                default:
                    break;
            }

            setIsOpen(false);
        } catch (error) {
            console.error('Error handling notification:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await socialService.markAllNotificationsAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await socialService.deleteNotification(notificationId);
            setNotifications(notifications.filter(n => n._id !== notificationId));
            if (!notifications.find(n => n._id === notificationId).read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
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
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                            <button
                                onClick={handleMarkAllRead}
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                Mark all as read
                            </button>
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-indigo-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start">
                                            {/* Notification icon based on type */}
                                            <div className="flex-shrink-0">
                                                <div className={`p-2 rounded-full ${notification.type === 'friend_request' ? 'bg-blue-100 text-blue-500' :
                                                    notification.type === 'challenge_invite' ? 'bg-green-100 text-green-500' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {notification.type === 'friend_request' && (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                    )}
                                                    {notification.type === 'challenge_invite' && (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Notification content */}
                                            <div className="ml-3 flex-1">
                                                <p className="text-sm text-gray-900">{notification.message}</p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNotification(notification._id);
                                                }}
                                                className="ml-2 text-gray-400 hover:text-gray-600"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;