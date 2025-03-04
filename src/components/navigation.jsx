import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// Updated navigation items with more detailed icons
const navigationItems = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        path: '/fitness',
        label: 'Fitness',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    },
    {
        path: '/nutrition',
        label: 'Nutrition',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
        )
    },
    {
        path: '/social',
        label: 'Social',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
    {
        path: '/gamification',
        label: 'Achievements',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        )
    },
    {
        path: '/analytics',
        label: 'Analytics',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
    {
        path: '/profile',
        label: 'Profile',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )
    }
];

export const NavigationMenu = ({ onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="nav-glass rounded-2xl border border-blue-500/10 overflow-hidden relative p-4"
        >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-500 opacity-70"></div>
            <div className="absolute top-0 right-0 w-1 h-20 bg-gradient-to-b from-blue-500 to-transparent opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-20 h-1 bg-gradient-to-r from-transparent to-blue-500 opacity-40"></div>
            
            {/* Navigation Items */}
            <div className="space-y-1">
                {navigationItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <motion.div
                            key={item.path}
                            className="relative"
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ opacity: 1 }}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="nav-active-bg"
                                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-500/20 rounded-lg"
                                    initial={{ borderRadius: 8 }}
                                />
                            )}
                            <motion.button
                                onClick={() => handleNavigation(item.path)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg relative z-10"
                                whileHover={{ x: 4 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <div className={`flex items-center justify-center rounded-lg transition-all ${isActive ? 'text-blue-400' : 'text-blue-200/70'}`}>
                                    {item.icon}
                                </div>
                                <span className={`font-medium transition-all ${isActive ? 'text-white' : 'text-blue-200/70'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active-indicator"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"
                                    />
                                )}
                            </motion.button>
                        </motion.div>
                    );
                })}
            </div>
            
            {/* User Stats Summary */}
            <div className="mt-8 pt-6 border-t border-blue-500/10">
                <h3 className="text-xs uppercase text-blue-200/50 font-medium tracking-wider px-4 mb-3">Daily Progress</h3>
                <div className="bg-black/40 rounded-lg p-3 border border-blue-500/10">
                    <div className="flex justify-between text-sm text-blue-200/70 mb-1">
                        <span>Steps Goal</span>
                        <span>3,248/5,000</span>
                    </div>
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-500"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const BreadcrumbNavigation = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-blue-200/70 mb-4"
        >
            <span className="text-blue-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </span>
            {pathSegments.map((segment, index) => (
                <div key={index} className="flex items-center">
                    {index > 0 && (
                        <svg className="w-3 h-3 mx-2 text-blue-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                    <span className="capitalize hover:text-blue-200 transition-colors">{segment}</span>
                </div>
            ))}
        </motion.div>
    );
};

NavigationMenu.propTypes = {
    onClose: PropTypes.func
};

export const MobileNavigationDrawer = ({ isOpen, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 ${isOpen ? 'block' : 'hidden'}`}
            onClick={onClose}
        >
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: isOpen ? 0 : '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-72 bg-black/80 border-l border-blue-500/10 flex flex-col z-50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fixed Header */}
                <div className="flex justify-between items-center p-4 border-b border-blue-500/10">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-500 bg-clip-text text-transparent">Fitness Tracker</h2>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="text-blue-200/70 hover:text-blue-200 p-1 rounded-full bg-black/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </motion.button>
                </div>
                
                {/* Scrollable Navigation Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Pass the onClose function to NavigationMenu */}
                    <NavigationMenu onClose={onClose} />
                </div>
                
                {/* Fixed Quick Actions at Bottom */}
                <div className="p-4 border-t border-blue-500/10 bg-black/40">
                    <h3 className="text-xs uppercase text-blue-200/50 font-medium tracking-wider mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                        <motion.button
                            whileHover={{ scale: 1.03, x: 5 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500/10 to-blue-500/10 
                                      rounded-lg text-blue-200 hover:from-blue-500/20 hover:to-blue-500/20"
                        >
                            <span className="flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Log Workout</span>
                            </span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.03, x: 5 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500/10 to-blue-500/10 
                                      rounded-lg text-blue-200 hover:from-blue-500/20 hover:to-blue-500/20"
                        >
                            <span className="flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

MobileNavigationDrawer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

// Add this to your CSS or global styles
// .nav-glass {
//   background: rgba(0, 0, 0, 0.3);
//   backdrop-filter: blur(10px);
//   box-shadow: 0 4px 30px rgba(254, 0, 0, 0.1);
// }

export default {
    NavigationMenu,
    BreadcrumbNavigation,
    MobileNavigationDrawer
};