// src/pages/NutritionPage.js
import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <PageHeader title="Nutrition Tracker" />

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('log')}
                className={`${
                  activeTab === 'log'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Log Meal
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Meal History
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`${
                  activeTab === 'goals'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Goals
              </button>
            </nav>
          </div>

          {/* Always show summary except on goals page */}
          {activeTab !== 'goals' && (
            <div className="mb-6">
              <NutritionSummary refresh={refreshData} />
            </div>
          )}

          {/* Tab Content */}
          <div className="mt-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionPage;