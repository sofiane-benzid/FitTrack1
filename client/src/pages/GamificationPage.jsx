import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import Badges from '../components/features/gamification/Badges';
import Leaderboard from '../components/features/gamification/Leaderboard';

const GamificationPage = () => {
  const [activeTab, setActiveTab] = useState('badges');

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader title="Achievements & Leaderboard" />

        {/* Tab Navigation */}
        <div className="border-b border-red-500/10 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('badges')}
              className={`${
                activeTab === 'badges'
                  ? 'border-red-500 text-orange-200'
                  : 'border-transparent text-orange-200/50 hover:text-orange-200 hover:border-red-500/50'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Badges & Achievements
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`${
                activeTab === 'leaderboard'
                  ? 'border-red-500 text-orange-200'
                  : 'border-transparent text-orange-200/50 hover:text-orange-200 hover:border-red-500/50'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Leaderboard
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {activeTab === 'badges' && <Badges />}
          {activeTab === 'leaderboard' && <Leaderboard />}
        </motion.div>
      </div>
    </div>
  );
};

export default GamificationPage;