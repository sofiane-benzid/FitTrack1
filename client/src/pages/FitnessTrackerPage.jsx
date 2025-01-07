import { useState } from 'react';
import ActivityLogger from '../components/features/fitness/ActivityLogger';
import ActivityList from '../components/features/fitness/ActivityList';
import  PageHeader  from '../components/common/PageHeader';


const FitnessTrackerPage = () => {
  const [activeTab, setActiveTab] = useState('log');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <PageHeader title="Fitness Tracker" />

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
                Log Activity
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Activity History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'log' ? (
            <ActivityLogger />
          ) : (
            <ActivityList />
          )}
        </div>
      </div>
    </div>
  );
};

export default FitnessTrackerPage;