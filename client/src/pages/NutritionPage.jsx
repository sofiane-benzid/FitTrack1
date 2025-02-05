import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MealTracker from '../components/features/nutrition/MealTracker';
import MealList from '../components/features/nutrition/MealList';
import NutritionSummary from '../components/features/nutrition/NutritionSummary';
import NutritionGoals from '../components/features/nutrition/NutritionGoals';
import { NavigationMenu, BreadcrumbNavigation, MobileNavigationDrawer } from '../components/navigation';
import NotificationsDropdown from '../components/features/notifications/NotificationsDropdown';
import Feedback from '../components/common/Feedback';
import { useAuth } from '../hooks/useAuth';

const NutritionPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('log');
  const [refreshData, setRefreshData] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleMealLogged = () => {
    setRefreshData(prev => !prev); // Trigger data refresh
    setActiveTab('history'); // Switch to history tab
    setFeedback({
      type: 'success',
      message: 'Meal logged successfully!'
    });
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
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Nutrition Tracker
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationsDropdown />
            <span className="text-orange-200">
              Welcome, {user?.profile?.fullName || user?.email || 'User'}
            </span>
            
            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-orange-200 hover:text-orange-400"
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
            <AnimatePresence>
              {feedback && (
                <Feedback
                  type={feedback.type}
                  message={feedback.message}
                  onClose={() => setFeedback(null)}
                />
              )}
            </AnimatePresence>

            {/* Always show summary except on goals page */}
            <AnimatePresence>
              {activeTab !== 'goals' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mb-6"
                >
                  <NutritionSummary refresh={refreshData} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-orange-500/20 mb-6"
            >
              <nav className="-mb-px flex space-x-8">
                {['log', 'history', 'goals'].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`${
                      activeTab === tab
                        ? 'border-red-500 text-orange-200'
                        : 'border-transparent text-orange-200/70 hover:text-orange-200 hover:border-red-500/50'
                    } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    {tab === 'log' ? 'Log Meal' :
                      tab === 'history' ? 'Meal History' :
                        'Goals'}
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
                className="bg-black/60 rounded-xl border border-red-500/10 p-6"
              >
                {activeTab === 'log' && <MealTracker onMealLogged={handleMealLogged} />}
                {activeTab === 'history' && <MealList refresh={refreshData} />}
                {activeTab === 'goals' && <NutritionGoals />}
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
  </div>
  );
};

export default NutritionPage;