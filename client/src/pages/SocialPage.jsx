import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { API_BASE_URL } from '../../../server/config/env';
import { NavigationMenu, BreadcrumbNavigation, MobileNavigationDrawer } from '../components/navigation';
import { useAuth } from '../hooks/useAuth';
import { QRCodeScanner } from '../components/common/QRCodeComponents';

const SocialPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/social/notifications`, {
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
  

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'feed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
          </svg>
        );
      case 'partners':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'challenges':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'friends':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleQRCodeScan = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/social/add-friend/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to process QR code');
        }

        const userData = await response.json();
        
        // If user was found through QR code, automatically show the friend request UI
        if (userData.qrCodeScanned) {
            setSelectedUser(userData);
            setShowProfileModal(true);
            setFeedback({
                type: 'success',
                message: 'QR Code scanned successfully!'
            });
        }
    } catch (error) {
        console.error('Error processing QR code:', error);
        setFeedback({
            type: 'error',
            message: 'Failed to process QR code: ' + error.message
        });
    }
};

return (
  <div className="min-h-screen bg-black">
    {/* Navigation Bar */}
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-black/80 backdrop-blur-sm border-b border-red-500/10 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Social Hub
          </span>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <NotificationsDropdown />
            <span className="hidden md:inline text-orange-200">
              Welcome, {user?.profile?.fullName || user?.email || 'User'}
            </span>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 md:hidden text-orange-200 hover:text-orange-400"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>

    <div className="max-w-7xl mx-auto py-4 md:py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb - Hide on mobile */}
        <div className="hidden md:block">
          <BreadcrumbNavigation />
        </div>

        <div className="grid md:grid-cols-[240px,1fr] gap-4 md:gap-6 mt-4 md:mt-6">
          {/* Navigation Sidebar - Hidden on mobile */}
          <div className="hidden md:block">
            <NavigationMenu />
          </div>

          {/* Main Content */}
          <div className="space-y-4 md:space-y-6">
            <AnimatePresence>
              {feedback && (
                <Feedback
                  type={feedback.type}
                  message={feedback.message}
                  onClose={() => setFeedback(null)}
                />
              )}
            </AnimatePresence>

            {/* Social Tabs - Scrollable on mobile */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-orange-500/20 mb-4 md:mb-6"
            >
              <nav className="-mb-px flex space-x-2 md:space-x-8 overflow-x-auto scrollbar-hide py-2">
                {['feed', 'partners', 'challenges', 'friends'].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`${
                      activeTab === tab
                        ? 'border-red-500 text-orange-200'
                        : 'border-transparent text-orange-200/70 hover:text-orange-200 hover:border-red-500/50'
                    } whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors min-h-[44px] flex items-center gap-2`}
                  >
                    {getTabIcon(tab)}
                    <span className="capitalize">{tab}</span>
                  </motion.button>
                ))}
              </nav>
            </motion.div>

            {/* Tab Content */}
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
                  <div className="space-y-4 md:space-y-8">
                    {selectedPartner ? (
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedPartner(null)}
                          className="w-full md:w-auto px-4 py-3 md:py-2 bg-black/40 text-white rounded-lg border border-orange-500/20"
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                    <div className="space-y-4 md:space-y-8">
                      <FriendsList
                        onChatOpen={setSelectedChat}
                        onPartnerSelect={setSelectedPartner}
                      />
                      <FriendRequests />
                    </div>
                    <div className="space-y-4">
                      <UserSearch onSuccess={fetchNotifications} />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowScanner(true)}
                        className="w-full md:w-auto px-4 py-3 md:py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                      >
                        Scan QR Code
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile Navigation Drawer */}
    <MobileNavigationDrawer 
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
    />

    {/* Chat Window Modal */}
    <AnimatePresence>
      {selectedChat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="w-full max-w-2xl h-[90vh] md:h-[600px] bg-black/90 rounded-xl border border-orange-500/20">
            <ChatWindow
              chatId={selectedChat}
              onClose={() => setSelectedChat(null)}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* QR Scanner Modal */}
    <AnimatePresence>
      {showScanner && (
        <QRCodeScanner
          onScan={handleQRCodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </AnimatePresence>
  </div>
);

};

export default SocialPage;