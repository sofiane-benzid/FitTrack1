import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ActivityLogger from '../components/features/fitness/ActivityLogger';
import ActivityList from '../components/features/fitness/ActivityList';
import PageHeader from '../components/common/PageHeader';
import Feedback from '../components/common/Feedback';
import { API_BASE_URL } from '../../../server/config/env';

const FitnessTrackerPage = () => {
  const [activeTab, setActiveTab] = useState('log');
  const [feedback, setFeedback] = useState(null);
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    weeklyActivities: 0,
    streak: 0
  });

  useEffect(() => {
    fetchActivityStats();
  }, []);

  const fetchActivityStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/activity/summary`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity stats');
      }

      const data = await response.json();
      setActivityStats({
        totalActivities: data.totalActivities || 0,
        weeklyActivities: data.weeklyActivities || 0,
        streak: data.streak || 0
      });
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      setFeedback({
        type: 'error',
        message: 'Failed to load activity statistics'
      });
    }
  };

  const handleActivityLogged = () => {
    setFeedback({
      type: 'success',
      message: 'Activity logged successfully!'
    });
    fetchActivityStats(); // Refresh stats
  };

  const handleError = (error) => {
    setFeedback({
      type: 'error',
      message: error.message || 'An error occurred'
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <PageHeader title="Fitness Tracker" />

          {feedback && (
            <div className="mb-6">
              <Feedback
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback(null)}
              />
            </div>
          )}

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black to-red-950/30 p-6 rounded-xl 
                        border border-red-500/10 hover:border-red-500/20 transition-all duration-300"
            >
              <h3 className="text-sm font-medium text-orange-200/70">Total Activities</h3>
              <p className="mt-2 text-3xl font-bold text-orange-200">{activityStats.totalActivities}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-black to-red-950/30 p-6 rounded-xl 
                        border border-red-500/10 hover:border-red-500/20 transition-all duration-300"
            >
              <h3 className="text-sm font-medium text-orange-200/70">This Week</h3>
              <p className="mt-2 text-3xl font-bold text-orange-200">{activityStats.weeklyActivities}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-black to-red-950/30 p-6 rounded-xl 
                        border border-red-500/10 hover:border-red-500/20 transition-all duration-300"
            >
              <h3 className="text-sm font-medium text-orange-200/70">Activity Streak</h3>
              <p className="mt-2 text-3xl font-bold text-orange-200">{activityStats.streak} days</p>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-red-500/10 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('log')}
                className={`${
                  activeTab === 'log'
                    ? 'border-red-500 text-orange-200'
                    : 'border-transparent text-orange-200/70 hover:text-orange-200 hover:border-red-500/50'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Log Activity
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-red-500 text-orange-200'
                    : 'border-transparent text-orange-200/70 hover:text-orange-200 hover:border-red-500/50'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Activity History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-gradient-to-br from-black to-red-950/30 rounded-xl border border-red-500/10 p-6">
            {activeTab === 'log' ? (
              <ActivityLogger onSuccess={handleActivityLogged} onError={handleError} />
            ) : (
              <ActivityList onError={handleError} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessTrackerPage;