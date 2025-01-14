import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import FriendsList from '../components/features/social/FriendsList';
import UserSearch from '../components/features/social/UserSearch';
import Challenges from '../components/features/social/Challenges';
import FriendRequests from '../components/features/social/FriendRequests';

const SocialPage = () => {
  const [activeTab, setActiveTab] = useState('friends');

  // Tab configuration with icons and additional info
  const tabs = [
    {
      key: 'friends',
      label: 'Friends',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.5 17c0-2.757 1.834-5.064 4.243-5.847C15.343 10.509 14.232 10 13 10H7c-1.232 0-2.343.51-3.743 1.153C1.166 11.936 0 13.68 0 15.56V17h12.5z" />
        </svg>
      )
    },
    {
      key: 'requests',
      label: 'Friend Requests',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      key: 'search',
      label: 'Find Friends',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      key: 'challenges',
      label: 'Challenges',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm9 3a2 2 0 11-4 0 2 2 0 014 0zm-6 4a2 2 0 100-4 2 2 0 000 4zm8 2a2 2 0 11-4 0 2 2 0 014 0zm2 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black/90">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header with Gradient */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <PageHeader
              title="Social Hub"
              className="text-white bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
            />
          </motion.div>

          {/* Tab Navigation */}
          <div className="border-b border-orange-500/20 mb-6">
            <nav className="-mb-px flex space-x-4">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex items-center whitespace-nowrap pb-4 px-3 border-b-2 font-medium text-sm 
                    transition-all duration-300 ease-in-out
                    ${activeTab === tab.key
                      ? 'border-gradient-to-r from-red-500 to-orange-500 text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Tab Content with Animated Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              {activeTab === 'friends' && <FriendsList />}
              {activeTab === 'requests' && <FriendRequests />}
              {activeTab === 'search' && <UserSearch />}
              {activeTab === 'challenges' && <Challenges />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SocialPage;