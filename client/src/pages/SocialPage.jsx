import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import FriendsList from '../components/features/social/FriendsList';
import UserSearch from '../components/features/social/UserSearch';
import Challenges from '../components/features/social/Challenges';
import FriendRequests from '../components/features/social/FriendRequests';

const SocialPage = () => {
  const [activeTab, setActiveTab] = useState('friends');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <PageHeader title="Social Hub" />

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('friends')}
                className={`${
                  activeTab === 'friends'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Friends
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`${
                  activeTab === 'requests'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } relative whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Friend Requests
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`${
                  activeTab === 'search'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Find Friends
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`${
                  activeTab === 'challenges'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Challenges
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'friends' && <FriendsList />}
            {activeTab === 'requests' && <FriendRequests />}
            {activeTab === 'search' && <UserSearch />}
            {activeTab === 'challenges' && <Challenges />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPage;