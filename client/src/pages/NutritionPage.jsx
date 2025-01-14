import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import MealTracker from '../components/features/nutrition/MealTracker';
import MealList from '../components/features/nutrition/MealList';
import NutritionSummary from '../components/features/nutrition/NutritionSummary';
import NutritionGoals from '../components/features/nutrition/NutritionGoals';

const NutritionPage = () => {
  const [activeTab, setActiveTab] = useState('log');
  const [refreshData, setRefreshData] = useState(false);

  const handleMealLogged = () => {
    setRefreshData(prev => !prev);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'log':
        return <MealTracker onMealLogged={handleMealLogged} />;
      case 'history':
        return <MealList refresh={refreshData} />;
      case 'goals':
        return <NutritionGoals />;
      default:
        return <MealTracker onMealLogged={handleMealLogged} />;
    }
  };

  const tabVariants = {
    active: {
      borderColor: 'rgb(249, 88, 44)',
      color: 'rgb(249, 88, 44)'
    },
    inactive: {
      borderColor: 'transparent',
      color: 'rgb(156, 163, 175)'
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <PageHeader title="Nutrition Tracker" className="text-white" />

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-b border-orange-500/20 mb-6"
          >
            <nav className="-mb-px flex space-x-8">
              {['log', 'history', 'goals'].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  variants={tabVariants}
                  animate={activeTab === tab ? 'active' : 'inactive'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all"
                >
                  {tab === 'log' ? 'Log Meal' :
                    tab === 'history' ? 'Meal History' :
                      'Goals'}
                </motion.button>
              ))}
            </nav>
          </motion.div>

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

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NutritionPage;