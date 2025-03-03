import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Feedback from '../common/Feedback';

const ProfileEditForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        weight: '',
        height: '',
        gender: '',
        fitnessLevel: 'beginner',
        fitnessGoals: [],
        activityPreferences: []
    });
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        setFormData({
            fullName: initialData.fullName || '',
            age: initialData.age || '',
            weight: initialData.weight || '',
            height: initialData.height || '',
            gender: initialData.gender || '',
            fitnessLevel: initialData.fitnessLevel || 'beginner',
            fitnessGoals: initialData.fitnessGoals || [],
            activityPreferences: initialData.activityPreferences || []
        });
    }, [initialData]);

    const fitnessGoalsOptions = [
        { label: 'Weight Loss', value: 'weight_loss', icon: '🔥' },
        { label: 'Muscle Gain', value: 'muscle_gain', icon: '💪' },
        { label: 'Endurance', value: 'endurance', icon: '🏁' },
        { label: 'Flexibility', value: 'flexibility', icon: '🤸' },
        { label: 'General Fitness', value: 'general_fitness', icon: '❤️' }
    ];

    const activityOptions = [
        { label: 'Running', value: 'running', icon: '🏃' },
        { label: 'Weight Training', value: 'weightlifting', icon: '🏋️' },
        { label: 'Yoga', value: 'yoga', icon: '🧘' },
        { label: 'Swimming', value: 'swimming', icon: '🏊' },
        { label: 'Cycling', value: 'cycling', icon: '🚴' },
        { label: 'Walking', value: 'walking', icon: '🚶' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMultiSelect = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);

        try {
            // Validate form data
            if (!formData.fullName?.trim()) {
                throw new Error('Name is required');
            }

            if (formData.age && (formData.age < 13 || formData.age > 120)) {
                throw new Error('Please enter a valid age between 13 and 120');
            }

            await onSubmit(formData);
            setFeedback({
                type: 'success',
                message: 'Profile updated successfully!'
            });
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black/90 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto bg-black/60 p-8 rounded-2xl border border-blue-500/20 shadow-2xl"
            >
                <h2 className="text-3xl font-bold text-white text-center mb-4">
                    Edit Profile
                </h2>

                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6"
                        >
                            <Feedback
                                type={feedback.type}
                                message={feedback.message}
                                onClose={() => setFeedback(null)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Basic Information */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-200">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md bg-black/30 border border-blue-500/20 text-white focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-200">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md bg-black/30 border border-blue-500/20 text-white focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-200">Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md bg-black/30 border border-blue-500/20 text-white focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-200">Height (cm)</label>
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md bg-black/30 border border-blue-500/20 text-white focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-200">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md bg-black/30 border border-blue-500/20 text-white focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="" className="bg-black">Select gender</option>
                                <option value="male" className="bg-black">Male</option>
                                <option value="female" className="bg-black">Female</option>
                                <option value="other" className="bg-black">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-200">Fitness Level</label>
                            <select
                                name="fitnessLevel"
                                value={formData.fitnessLevel}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md bg-black/30 border border-blue-500/20 text-white focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="beginner" className="bg-black">Beginner</option>
                                <option value="intermediate" className="bg-black">Intermediate</option>
                                <option value="advanced" className="bg-black">Advanced</option>
                            </select>
                        </div>
                    </div>

                    {/* Fitness Goals */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-200 mb-2">
                            Fitness Goals
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {fitnessGoalsOptions.map(goal => (
                                <motion.button
                                    key={goal.value}
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleMultiSelect('fitnessGoals', goal.value)}
                                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${formData.fitnessGoals.includes(goal.value)
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                >
                                    <span>{goal.icon}</span>
                                    <span>{goal.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Activity Preferences */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-200 mb-2">
                            Preferred Activities
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {activityOptions.map(activity => (
                                <motion.button
                                    key={activity.value}
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleMultiSelect('activityPreferences', activity.value)}
                                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${formData.activityPreferences.includes(activity.value)
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                >
                                    <span>{activity.icon}</span>
                                    <span>{activity.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-6">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onCancel}
                            className="px-4 py-2 bg-black/40 text-white rounded-lg hover:bg-black/60 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </motion.button>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg text-white
                                ${loading
                                    ? 'bg-gray-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                                } transition-all duration-300`}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

ProfileEditForm.propTypes = {
    initialData: PropTypes.shape({
        fullName: PropTypes.string,
        age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        gender: PropTypes.string,
        fitnessLevel: PropTypes.string,
        fitnessGoals: PropTypes.arrayOf(PropTypes.string),
        activityPreferences: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default ProfileEditForm;