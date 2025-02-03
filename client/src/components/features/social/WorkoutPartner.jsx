import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Feedback from '../../common/Feedback';
import WorkoutReminder from './WorkoutReminder';
import SharedActivities from './SharedActivities';
import ChatWindow from './ChatWindow';
import ThemedDatePicker from '../../common/ThemedDatePicker';
import { API_BASE_URL } from '../../../../../server/config/env';

const WorkoutPartner = ({ partnerId }) => {
    const [partnership, setPartnership] = useState(null);
    const [, setPartnerDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ setError] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState({ title: '', targetDate: '' });
    const [stats, setStats] = useState({
        totalWorkoutsTogether: 0,
        streakDays: 0,
        achievedGoals: 0
    });
    const [activeSection, setActiveSection] = useState('overview');
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {

        const fetchPartnershipData = async () => {
            try {
                const [partnershipRes, partnerRes] = await Promise.all([
                    fetch(`${API_BASE_URL}partnerships/${partnerId}`, { // Fixed URL
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }),
                    fetch(`${API_BASE_URL}/social/users/${partnerId}/profile`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                ]);

                if (!partnershipRes.ok || !partnerRes.ok) {
                    throw new Error('Failed to fetch partnership data');
                }

                const [partnershipData, partnerData] = await Promise.all([
                    partnershipRes.json(),
                    partnerRes.json()
                ]);

                setPartnership(partnershipData);
                setPartnerDetails(partnerData);
                setGoals(partnershipData.sharedGoals || []);
                calculateStats(partnershipData);
            } catch (err) {
                setError('Error loading partnership data'); // Now this will work
                setFeedback({
                    type: 'error',
                    message: 'Failed to load partnership data'
                });
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (partnerId) {
            fetchPartnershipData();
        } else {
            // Reset loading if no partner selected
            setLoading(false);
        }
    }, [partnerId, setError, setPartnerDetails]);



    const calculateStats = (partnershipData) => {
        // Calculate stats based on partnership data
        const achievedGoals = partnershipData.sharedGoals?.filter(goal => goal.completed).length || 0;
        setStats({
            totalWorkoutsTogether: partnershipData.workoutsTogether || 0,
            streakDays: partnershipData.currentStreak || 0,
            achievedGoals
        });
    };

    const handleAddGoal = async () => {
        if (!newGoal.title || !newGoal.targetDate) {
            setFeedback({
                type: 'error',
                message: 'Please fill in all goal fields'
            });
            return;
        }
    
        try {
            const response = await fetch(`${API_BASE_URL}/partnerships/${partnership._id}/goals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newGoal)
            });
    
            if (!response.ok) throw new Error('Failed to add goal');
    
            // Refetch partnership data to get updated goals
            const partnershipRes = await fetch(`${API_BASE_URL}/partnerships/${partnerId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (!partnershipRes.ok) {
                throw new Error('Failed to fetch updated partnership data');
            }
    
            const partnershipData = await partnershipRes.json();
    
            // Update goals and stats
            setGoals(partnershipData.sharedGoals || []);
            calculateStats(partnershipData);
    
            // Reset new goal form
            setNewGoal({ title: '', targetDate: '' });
            
            // Set success feedback
            setFeedback({
                type: 'success',
                message: 'Goal added successfully!'
            });
        } catch (err) {
            console.error(err);
            setFeedback({
                type: 'error',
                message: 'Failed to add goal'
            });
        }
    };

    const toggleGoalComplete = async (goalId) => {
        try {
            const response = await fetch(`${API_BASE_URL}partnerships/${partnership._id}/goals/${goalId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to update goal');

            const updatedPartnership = await response.json();
            setGoals(updatedPartnership.sharedGoals);
            calculateStats(updatedPartnership);
        } catch (err) {
            console.error(err);
            setFeedback({
                type: 'error',
                message: 'Failed to update goal'
            });
        }
    };

    const handleChatOpen = () => {
        if (!partnership?.chatRoom?._id) {
            setFeedback({
                type: 'error',
                message: 'Chat room not found'
            });
            return;
        }
        setShowChat(true);
    };


    if (!partnerId) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-black/60 rounded-xl border border-orange-500/20"
            >
                <h3 className="text-xl font-medium text-white mb-4">No Workout Partner Selected</h3>
                <p className="text-orange-200/70">
                    Select a friend from your Friends list to start a workout partnership
                </p>
            </motion.div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    return (
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

            {/* Partnership Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/60 p-6 rounded-xl border border-orange-500/20"
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Workout Partnership with {partnership?.partners?.find(p => p._id !== partnerId)?.fullName || 'Partner'}
                        </h2>
                        <p className="text-orange-200/70 mt-1">
                            Started on {new Date(partnership?.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleChatOpen}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                        >
                            Open Chat
                        </motion.button>
                    </div>
                </div>

                {/* Section Navigation */}
                <div className="flex space-x-4 mt-6 border-b border-orange-500/20">
                    {['overview', 'goals', 'activities', 'reminders'].map((section) => (
                        <motion.button
                            key={section}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveSection(section)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeSection === section
                                ? 'bg-orange-500/20 text-white'
                                : 'text-orange-200/70 hover:text-white'
                                }`}
                        >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <AnimatePresence>
                {showChat && partnership?.chatRoom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowChat(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-black/90 rounded-xl border border-orange-500/20 w-full max-w-2xl h-[600px] m-4"
                        >
                            <ChatWindow
                                chatId={partnership.chatRoom._id}
                                onClose={() => setShowChat(false)}
                                partnerId={partnerId}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Partnership Stats */}
            {activeSection === 'overview' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-4"
                >
                    {Object.entries(stats).map(([key, value]) => (
                        <div key={key} className="bg-black/40 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-orange-400">{value}</p>
                            <p className="text-sm text-orange-200/70">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </p>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Shared Goals Section */}
            {activeSection === 'goals' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/60 p-6 rounded-xl border border-orange-500/20"
                >
                    <h3 className="text-lg font-medium text-white mb-4">Shared Goals</h3>

                    {/* Add New Goal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                            <label className="block text-sm text-orange-200/70">Goal Title</label>
                            <input
                                type="text"
                                value={newGoal.title}
                                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                placeholder="Enter your goal..."
                                className="w-full bg-black/40 border border-orange-500/20 rounded-lg px-4 py-2 
                             text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm text-orange-200/70">Target Date</label>
                            <ThemedDatePicker
                                selectedDate={newGoal.targetDate}
                                onDateChange={(date) => setNewGoal(prev => ({ ...prev, targetDate: date }))}
                                minDate={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAddGoal}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                            >
                                Add Goal
                            </motion.button>
                        </div>
                    </div>

                    {/* Goals List */}
                    <div className="space-y-3">
                        {goals.map((goal, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between bg-black/40 p-4 rounded-lg
                                border border-orange-500/10"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => toggleGoalComplete(goal._id)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                    ${goal.completed
                                                ? 'bg-gradient-to-r from-red-500 to-orange-500 border-transparent'
                                                : 'border-orange-500/50'
                                            }`}
                                    >
                                        {goal.completed && (
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </motion.button>
                                    <div>
                                        <p className={`text-white ${goal.completed ? 'line-through opacity-50' : ''}`}>
                                            {goal.title}
                                        </p>
                                        <p className="text-sm text-orange-200/70">
                                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {goals.length === 0 && (
                            <p className="text-center text-orange-200/70 py-4">No goals set yet</p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Shared Activities Section */}
            {activeSection === 'activities' && (
                <SharedActivities partnerId={partnerId} />
            )}

            {/* Workout Reminders Section */}
            {activeSection === 'reminders' && (
                <WorkoutReminder partnership={partnership} />
            )}
        </div>
    );
};

WorkoutPartner.propTypes = {
    partnerId: PropTypes.string,
};

export default WorkoutPartner;