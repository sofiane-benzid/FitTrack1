// src/pages/GamificationPage.js
import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import Badges from '../components/features/gamification/Badges';
import Leaderboard from '../components/features/gamification/Leaderboard';

const GamificationPage = () => {
  const [activeTab, setActiveTab] = useState('badges');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <PageHeader title="Achievements & Leaderboard" />

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('badges')}
                className={`${
                  activeTab === 'badges'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Badges & Achievements
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`${
                  activeTab === 'leaderboard'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Leaderboard
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'badges' && <Badges />}
            {activeTab === 'leaderboard' && <Leaderboard />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;