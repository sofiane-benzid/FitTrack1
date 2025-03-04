import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationsDropdown from '../components/features/notifications/NotificationsDropdown';
import { BreadcrumbNavigation, MobileNavigationDrawer, NavigationMenu } from '../components/navigation';
import { useAuth } from '../hooks/useAuth';

// Tooltip Component
const StatsTooltip = ({ children, content }) => (
  <div className="group relative">
    {children}
    <div className="absolute hidden group-hover:block -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full 
                    bg-black/90 text-neutral-200 text-sm px-3 py-1 rounded whitespace-nowrap z-50
                    border border-blue-500/20">
      {content}
    </div>
  </div>
);

StatsTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.string.isRequired
};

// Stats Card Component
const StatCard = ({ stat, onClick, index }) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.1 * index }}
    onClick={onClick}
    className={`bg-gradient-to-br from-black to-blue-950/30 p-6 rounded-xl border border-blue-500/10 
               hover:border-blue-500/20 transition-all duration-300
               ${onClick ? 'cursor-pointer' : ''}`}
  >
    <h3 className="text-lg font-medium text-neutral-200 mb-2">{stat.title}</h3>
    <StatsTooltip content={stat.tooltip}>
      <p className="text-3xl font-bold text-blue-500">{stat.value}</p>
    </StatsTooltip>
  </motion.div>
);

StatCard.propTypes = {
  stat: PropTypes.shape({
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired,
    isClickable: PropTypes.bool
  }).isRequired,
  onClick: PropTypes.func,
  index: PropTypes.number.isRequired
};

// Quick Action Button Component
const QuickActionButton = ({ action, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 + (index * 0.1) }}
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
    onClick={action.onClick}
    className="relative group bg-gradient-to-br from-black to-blue-950/30 p-6 rounded-xl 
             border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 
                    group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-blue-500/5 
                    rounded-xl transition-all duration-500"/>
    <div className="flex items-center space-x-3">
      <div className="relative p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg text-white">
        {action.icon}
        {action.stat && (
          <StatsTooltip content={`Recent activity trend: ${action.stat}`}>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </StatsTooltip>
        )}
      </div>
      <div className="text-left">
        <h3 className="font-medium text-neutral-200">{action.name}</h3>
        <p className="text-sm text-neutral-300">{action.description}</p>
      </div>
    </div>
  </motion.button>
);

QuickActionButton.propTypes = {
  action: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.node.isRequired,
    stat: PropTypes.string
  }).isRequired,
  index: PropTypes.number.isRequired
};

// Activity Item Component
const ActivityItem = ({ activity, index }) => (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    whileHover={{ x: 5 }}
    transition={{ delay: 0.1 * index }}
    className="flex justify-between items-center p-3 bg-gradient-to-r from-black to-blue-950/20 
              rounded-lg border border-blue-500/10 hover:border-blue-500/20 
              transition-all duration-300 cursor-pointer"
  >
    <div className="flex items-center space-x-3">
      <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
      <div>
        <span className="text-neutral-200">{activity.name}</span>
        {activity.highlight && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
            New PR!
          </span>
        )}
      </div>
    </div>
    <div className="flex items-center space-x-4">
      {activity.stats && (
        <span className="text-sm text-blue-300">{activity.stats}</span>
      )}
      <span className="text-sm text-neutral-300">{activity.time}</span>
    </div>
  </motion.div>
);

ActivityItem.propTypes = {
  activity: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    highlight: PropTypes.bool,
    stats: PropTypes.string
  }).isRequired,
  index: PropTypes.number.isRequired
};

// Weekly Insight Modal Component
const WeeklyInsightModal = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-gradient-to-br from-black to-blue-950/30 p-6 rounded-xl border border-blue-500/20
                    max-w-lg w-full mx-4 space-y-4"
        >
          <h3 className="text-xl font-bold text-neutral-200">Weekly Progress Insight</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-200/80">Steps Goal Progress</span>
              <span className="text-neutral-200">65%</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-neutral-200/60 text-sm">Total Steps</p>
                <p className="text-2xl font-bold text-neutral-200">24,562</p>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-neutral-200/60 text-sm">Calories Burned</p>
                <p className="text-2xl font-bold text-neutral-200">1,284</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg
                     hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

WeeklyInsightModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

// Main Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showWeeklyInsight, setShowWeeklyInsight] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    {
      title: "Today's Goal",
      value: "5,000 steps",
      progress: 3248,
      tooltip: "Daily step goal - you've completed 3,248 steps so far"
    },
    {
      title: "Weekly Progress",
      value: "75%",
      isClickable: true,
      tooltip: "Click to view detailed weekly stats"
    },
    {
      title: "Active Days",
      value: "5/7",
      tooltip: "You've been active 5 out of 7 days this week"
    }
  ];

  const quickActions = [
    {
      name: 'Track Fitness',
      description: 'Log workouts and track your activity',
      onClick: () => navigate('/fitness'),
      stat: '+15% more active',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      name: 'Track Nutrition',
      description: 'Log meals and monitor your diet',
      onClick: () => navigate('/nutrition'),
      stat: 'On track',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      name: 'Social Hub',
      description: 'Connect with friends and join challenges',
      onClick: () => navigate('/social'),
      stat: '3 new friends',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Achievements',
      description: 'View your badges and rankings',
      onClick: () => navigate('/gamification'),
      stat: '2 new badges',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      name: 'Analytics',
      description: 'View your progress and stats',
      onClick: () => navigate('/analytics'),
      stat: '+12% this week',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  const recentActivities = [
    {
      id: 1,
      name: 'Morning Run',
      time: '2 hours ago',
      color: 'bg-blue-500',
      highlight: true,
      stats: '5.2 km'
    },
    {
      id: 2,
      name: 'Weight Training',
      time: 'Yesterday',
      color: 'bg-blue-500',
      stats: '320 calories'
    },
    {
      id: 3,
      name: 'Yoga Session',
      time: '2 days ago',
      color: 'bg-blue-500',
      stats: '45 minutes'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/80 backdrop-blur-sm border-b border-blue-500/10 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.span
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/dashboard')}
                className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent 
                          cursor-pointer"
              >
                Fitness Tracker
              </motion.span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationsDropdown />
              <span className="text-neutral-200">
                Welcome, {user?.profile?.fullName || user?.email || 'User'}
              </span>

              {/* Profile and Logout Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  className="text-neutral-200 hover:text-blue-400 px-4 py-2 rounded-md transition-colors"
                >
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-md 
             transition-all duration-300 hover:shadow-lg hover:shadow-neutral-300/20"
                >
                  Logout
                </motion.button>
              </div>

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

      {/* Main Content with Sidebar Navigation */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <BreadcrumbNavigation />

          <div className="grid md:grid-cols-[240px,1fr] gap-6 mt-6">
            {/* Navigation Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
              <NavigationMenu />
            </div>

            {/* Dashboard Content */}
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <StatCard
                    key={stat.title}
                    stat={stat}
                    index={index}
                    onClick={stat.isClickable ? () => setShowWeeklyInsight(true) : undefined}
                  />
                ))}
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                  <QuickActionButton
                    key={action.name}
                    action={action}
                    index={index}
                  />
                ))}
              </div>

              {/* Recent Activity */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-black to-blue-950/30 rounded-xl border border-blue-500/10"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-neutral-200">Recent Activity</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => navigate('/fitness')}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View All
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNavigationDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Weekly Insight Modal */}
      <WeeklyInsightModal
        isOpen={showWeeklyInsight}
        onClose={() => setShowWeeklyInsight(false)}
      />
    </div>
  );
};

export default Dashboard;