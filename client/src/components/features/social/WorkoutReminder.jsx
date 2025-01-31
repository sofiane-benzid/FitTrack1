import { useState} from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Feedback from '../../common/Feedback';

const WorkoutReminder = ({ partnership }) => {
    const [reminders, setReminders] = useState(partnership?.reminderPreferences || {
        enabled: true,
        frequency: 'daily',
        customDays: [],
        time: '09:00'
    });
    const [feedback, setFeedback] = useState(null);

    const handleSaveReminders = async () => {
        try {
            const response = await fetch(`http://localhost:5000/partnerships/${partnership._id}/reminders`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reminderPreferences: reminders })
            });

            if (!response.ok) throw new Error('Failed to update reminders');

            setFeedback({
                type: 'success',
                message: 'Reminder preferences updated!'
            });
        } catch (err) {
            console.error(err);
            setFeedback({
                type: 'error',
                message: 'Failed to update reminders'
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/60 p-6 rounded-xl border border-orange-500/20"
        >
            <h3 className="text-lg font-medium text-white mb-4">Workout Reminders</h3>

            <div className="space-y-4">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                    <span className="text-orange-200">Enable Reminders</span>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setReminders(prev => ({ ...prev, enabled: !prev.enabled }))}
                        className={`relative w-14 h-7 rounded-full transition-colors ${reminders.enabled ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gray-600'
                            }`}
                    >
                        <motion.div
                            animate={{ x: reminders.enabled ? 28 : 2 }}
                            className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full"
                        />
                    </motion.button>
                </div>

                {reminders.enabled && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            {/* Frequency Selection */}
                            <div>
                                <label className="block text-sm font-medium text-orange-200 mb-2">
                                    Reminder Frequency
                                </label>
                                <select
                                    value={reminders.frequency}
                                    onChange={(e) => setReminders(prev => ({ ...prev, frequency: e.target.value }))}
                                    className="w-full bg-black/40 border border-orange-500/20 rounded-lg px-4 py-2 
                           text-white focus:outline-none focus:border-orange-500"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>

                            {/* Custom Days Selection */}
                            {reminders.frequency === 'custom' && (
                                <div>
                                    <label className="block text-sm font-medium text-orange-200 mb-2">
                                        Select Days
                                    </label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                            <motion.button
                                                key={day}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setReminders(prev => ({
                                                    ...prev,
                                                    customDays: prev.customDays.includes(day)
                                                        ? prev.customDays.filter(d => d !== day)
                                                        : [...prev.customDays, day]
                                                }))}
                                                className={`p-2 rounded-lg text-sm ${reminders.customDays.includes(day)
                                                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                                        : 'bg-black/40 text-orange-200'
                                                    }`}
                                            >
                                                {day}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Time Selection */}
                            <div>
                                <label className="block text-sm font-medium text-orange-200 mb-2">
                                    Reminder Time
                                </label>
                                <input
                                    type="time"
                                    value={reminders.time}
                                    onChange={(e) => setReminders(prev => ({ ...prev, time: e.target.value }))}
                                    className="w-full bg-black/40 border border-orange-500/20 rounded-lg px-4 py-2 
                           text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            {/* Save Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveReminders}
                                className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white 
                         rounded-lg hover:from-red-600 hover:to-orange-600"
                            >
                                Save Reminder Settings
                            </motion.button>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <AnimatePresence>
                {feedback && (
                    <Feedback
                        type={feedback.type}
                        message={feedback.message}
                        onClose={() => setFeedback(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
WorkoutReminder.propTypes = {
    partnership: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        reminderPreferences: PropTypes.shape({
            enabled: PropTypes.bool,
            frequency: PropTypes.string,
            customDays: PropTypes.arrayOf(PropTypes.string),
            time: PropTypes.string
        })
    }).isRequired
};

export default WorkoutReminder;