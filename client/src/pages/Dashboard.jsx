import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationsDropdown from '../components/features/notifications/NotificationsDropdown';


const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const quickActions = [
    {
      name: 'Track Fitness',
      description: 'Log workouts and track your activity',
      path: '/fitness',
      bgColor: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      name: 'Track Nutrition',
      description: 'Log meals and monitor your diet',
      path: '/nutrition',
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      name: 'Social Hub',
      description: 'Connect with friends and join challenges',
      path: '/social',
      bgColor: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Achievements',
      description: 'View your badges and rankings',
      path: '/gamification',
      bgColor: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      name: 'Analytics',
      description: 'View your progress and stats',
      path: '/analytics',
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17a4 4 0 100-8 4 4 0 000 8zm0 0v5m0-5H6m5 0h5" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span
                onClick={() => navigate('/dashboard')}
                className="text-xl font-bold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
              >
                Fitness Tracker
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationsDropdown />
              <span className="text-gray-600">
                Welcome, {user?.profile?.fullName || user?.email || 'User'}
              </span>

              <button
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-md transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
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
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Today&apos;s Goal</h3>
            <p className="text-3xl font-bold text-indigo-600">5,000 steps</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Weekly Progress</h3>
            <p className="text-3xl font-bold text-green-600">75%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Days</h3>
            <p className="text-3xl font-bold text-blue-600">5/7</p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => navigate(action.path)}
              className={`${action.bgColor} ${action.hoverColor} text-white p-6 rounded-lg shadow hover:shadow-lg transition-all transform hover:-translate-y-1`}
            >
              <div className="flex items-center space-x-3">
                {action.icon}
                <div className="text-left">
                  <h3 className="font-medium">{action.name}</h3>
                  <p className="text-sm text-gray-100">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <button
                onClick={() => navigate('/fitness')}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Morning Run</span>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Weight Training</span>
                </div>
                <span className="text-sm text-gray-500">Yesterday</span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Yoga Session</span>
                </div>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;