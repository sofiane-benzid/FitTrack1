import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../server/config/env';
import Feedback from '../components/common/Feedback';
import PageHeader from '../components/common/PageHeader';
import ActivityList from '../components/features/fitness/ActivityList';
import ActivityLogger from '../components/features/fitness/ActivityLogger';
import NotificationsDropdown from '../components/features/notifications/NotificationsDropdown';
import { BreadcrumbNavigation, MobileNavigationDrawer, NavigationMenu } from '../components/navigation';
import { useAuth } from '../hooks/useAuth';

const FitnessTrackerPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('log');
  const [feedback, setFeedback] = useState(null);
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    weeklyActivities: 0,
    streak: 0
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


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
      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/80 backdrop-blur-sm border-b border-blue-500/10 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                Fitness Tracker
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationsDropdown />
              <span className="text-neutral-200">
                Welcome, {user?.profile?.fullName || user?.email || 'User'}
              </span>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-neutral-200 hover:text-blue-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Breadcrumb */}
          <BreadcrumbNavigation />

          <div className="grid md:grid-cols-[240px,1fr] gap-6 mt-6">
            {/* Navigation Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
              <NavigationMenu />
            </div>

            {/* Main Content */}
            <div className="space-y-6">
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
                  className="bg-gradient-to-br from-black to-blue-950/30 p-6 rounded-xl 
                          border border-blue-500/10 hover:border-blue-500/20 transition-all duration-300"
                >
                  <h3 className="text-sm font-medium text-neutral-300">Total Activities</h3>
                  <p className="mt-2 text-3xl font-bold text-neutral-200">{activityStats.totalActivities}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-black to-blue-950/30 p-6 rounded-xl 
                          border border-blue-500/10 hover:border-blue-500/20 transition-all duration-300"
                >
                  <h3 className="text-sm font-medium text-neutral-300">This Week</h3>
                  <p className="mt-2 text-3xl font-bold text-neutral-200">{activityStats.weeklyActivities}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-black to-blue-950/30 p-6 rounded-xl 
                          border border-blue-500/10 hover:border-blue-500/20 transition-all duration-300"
                >
                  <h3 className="text-sm font-medium text-neutral-300">Activity Streak</h3>
                  <p className="mt-2 text-3xl font-bold text-neutral-200">{activityStats.streak} days</p>
                </motion.div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-blue-500/10 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('log')}
                    className={`${activeTab === 'log'
                      ? 'border-blue-500 text-neutral-200'
                      : 'border-transparent text-neutral-300 hover:text-neutral-200 hover:border-blue-500/50'
                      } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    Log Activity
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`${activeTab === 'history'
                      ? 'border-blue-500 text-neutral-200'
                      : 'border-transparent text-neutral-300 hover:text-neutral-200 hover:border-blue-500/50'
                      } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    Activity History
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="bg-gradient-to-br from-black to-blue-950/30 rounded-xl border border-blue-500/10 p-6">
                {activeTab === 'log' ? (
                  <ActivityLogger onSuccess={handleActivityLogged} onError={handleError} />
                ) : (
                  <ActivityList onError={handleError} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNavigationDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
};

export default FitnessTrackerPage;