import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import FriendsList from '../components/features/social/FriendsList';
import UserSearch from '../components/features/social/UserSearch';
import Challenges from '../components/features/social/Challenges';
import FriendRequests from '../components/features/social/FriendRequests';
import WorkoutPartner from '../components/features/social/WorkoutPartner';
import ChatWindow from '../components/features/social/ChatWindow';
import ActivityFeed from '../components/features/social/ActivityFeed';
import NotificationsDropdown from '../components/features/notifications/NotificationsDropdown';
import Feedback from '../components/common/Feedback';
import PartnerSelection from '../components/features/social/PartnerSelection';

const SocialPage = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/social/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const tabs = [
    {
      key: 'feed',
      label: 'Activity Feed',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    {
      key: 'partners',
      label: 'Partners',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      key: 'challenges',
      label: 'Challenges',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      key: 'friends',
      label: 'Friends',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black/90 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <PageHeader
            title="Social Hub"
            subtitle="Connect, compete, and stay motivated with friends"
          />
        </div>

        {/* Notifications and Navigation */}
        <div className="bg-black/60 rounded-xl border border-orange-500/20 mb-8">
          <div className="flex items-center justify-between p-4 border-b border-orange-500/20">
            <div className="flex gap-2 items-center">
              <NotificationsDropdown
                notifications={notifications}
                onNotificationClick={fetchNotifications}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200
                  ${activeTab === tab.key
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'feed' && <ActivityFeed />}
            {activeTab === 'partners' && (
              <div className="space-y-8">
                {selectedPartner ? (
                  <div className="flex justify-between items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedPartner(null)}
                      className="px-4 py-2 bg-black/40 text-white rounded-lg border border-orange-500/20"
                    >
                      ← Back to Partners
                    </motion.button>
                  </div>
                ) : (
                  <PartnerSelection
                    onPartnerSelect={(partnerId) => setSelectedPartner(partnerId)}
                  />
                )}

                {selectedPartner && (
                  <WorkoutPartner
                    partnerId={selectedPartner}
                  />
                )}
              </div>
            )}

            {activeTab === 'challenges' && <Challenges />}
            {activeTab === 'friends' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <FriendsList
                    onChatOpen={setSelectedChat}
                    onPartnerSelect={setSelectedPartner}
                  />
                  <FriendRequests />
                </div>
                <UserSearch onSuccess={fetchNotifications} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Chat Window Modal */}
        <AnimatePresence>
          {selectedChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <ChatWindow
                chatId={selectedChat}
                onClose={() => setSelectedChat(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Messages */}
        <AnimatePresence>
          {feedback && (
            <Feedback
              type={feedback.type}
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SocialPage;