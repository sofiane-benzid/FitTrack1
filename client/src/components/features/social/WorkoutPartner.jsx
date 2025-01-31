import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Feedback from '../../common/Feedback';
import WorkoutReminder from './WorkoutReminder';

const WorkoutPartner = ({ partnerId, onChatOpen }) => {
    const [partnership, setPartnership] = useState(null);
    const [partnerDetails, setPartnerDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [setError] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState({ title: '', targetDate: '' });
    const [stats, setStats] = useState({
        totalWorkoutsTogether: 0,
        streakDays: 0,
        achievedGoals: 0
    });

    useEffect(() => {

        const fetchPartnershipData = async () => {
            try {
                const [partnershipRes, partnerRes] = await Promise.all([
                    fetch(`http://localhost:5000/partnerships?partnerId=${partnerId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }),
                    fetch(`http://localhost:5000/social/users/${partnerId}/profile`, {
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
                setError('Error loading partnership data');
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
    }, [partnerId, setError]);

   

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
            const response = await fetch(`http://localhost:5000/partnerships/${partnership._id}/goals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newGoal)
            });

            if (!response.ok) throw new Error('Failed to add goal');

            const updatedPartnership = await response.json();
            setGoals(updatedPartnership.sharedGoals);
            setNewGoal({ title: '', targetDate: '' });
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
            const response = await fetch(`http://localhost:5000/partnerships/${partnership._id}/goals/${goalId}`, {
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
                            Workout Partnership with {partnerDetails?.fullName}
                        </h2>
                        <p className="text-orange-200/70 mt-1">
                            Started on {new Date(partnership?.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onChatOpen(partnership.chatRoom)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                    >
                        Open Chat
                    </motion.button>
                </div>

                {/* Partnership Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {Object.entries(stats).map(([key, value]) => (
                        <div key={key} className="bg-black/40 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-orange-400">{value}</p>
                            <p className="text-sm text-orange-200/70">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Shared Goals */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/60 p-6 rounded-xl border border-orange-500/20"
            >
                <h3 className="text-lg font-medium text-white mb-4">Shared Goals</h3>

                {/* Add New Goal */}
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        placeholder="New goal title..."
                        className="flex-1 bg-black/40 border border-orange-500/20 rounded-lg px-4 py-2 
                     text-white focus:outline-none focus:border-orange-500"
                    />
                    <input
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                        className="bg-black/40 border border-orange-500/20 rounded-lg px-4 py-2 
                     text-white focus:outline-none focus:border-orange-500"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddGoal}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                    >
                        Add Goal
                    </motion.button>
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

            {/* Workout Reminders */}
            <WorkoutReminder partnership={partnership} />
        </div>
    );
};
WorkoutPartner.propTypes = {
    partnerId: PropTypes.string,
    onChatOpen: PropTypes.func.isRequired
};


export default WorkoutPartner;