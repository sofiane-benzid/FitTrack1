import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">Fitness Tracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {user?.email || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Today&apos;s Goal</h3>
            <p className="text-3xl font-bold text-indigo-600">5,000 steps</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Weekly Progress</h3>
            <p className="text-3xl font-bold text-green-600">75%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Active Days</h3>
            <p className="text-3xl font-bold text-blue-600">5/7</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                Log Workout
              </button>
              <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Track Nutrition
              </button>
              <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                View Progress
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Morning Run</span>
                <span className="text-gray-500">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Weight Training</span>
                <span className="text-gray-500">Yesterday</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Yoga Session</span>
                <span className="text-gray-500">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;