import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth';
import Feedback from '../common/Feedback';

// Fitness Transformation Insights
const transformationInsights = [
  "Your body is a work in progress, not a finished product.",
  "Small changes lead to massive transformations.",
  "Progress is not linear, but it is inevitable.",
  "Every challenge is an opportunity to grow stronger.",
  "Consistency beats perfection every time."
];

const ProfileEditForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        fullName: initialData.fullName || '',
        age: initialData.age || '',
        weight: initialData.weight || '',
        height: initialData.height || '',
        gender: initialData.gender || '',
        fitnessLevel: initialData.fitnessLevel || 'beginner',
        fitnessGoals: initialData.fitnessGoals || [],
        activityPreferences: initialData.activityPreferences || []
    });
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [currentInsight, setCurrentInsight] = useState('');
    const { updateProfile } = useAuth();

    // Rotate transformation insights
    useEffect(() => {
        const randomInsight = transformationInsights[Math.floor(Math.random() * transformationInsights.length)];
        setCurrentInsight(randomInsight);
        const intervalId = setInterval(() => {
            const newInsight = transformationInsights[Math.floor(Math.random() * transformationInsights.length)];
            setCurrentInsight(newInsight);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

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
            const processedData = {
                ...formData,
                age: Number(formData.age),
                weight: Number(formData.weight),
                height: Number(formData.height)
            };

            // Validate numeric fields
            if (processedData.age <= 0 || processedData.age > 120) {
                throw new Error('Please enter a valid age');
            }
            if (processedData.weight <= 0 || processedData.weight > 500) {
                throw new Error('Please enter a valid weight');
            }
            if (processedData.height <= 0 || processedData.height > 300) {
                throw new Error('Please enter a valid height');
            }

            const response = await fetch('http://localhost:5000/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ profile: processedData }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            await response.json();
            updateProfile(processedData);
            setFeedback({
                type: 'success',
                message: 'Profile updated successfully!'
            });

            // Wait a moment to show success message before closing
            setTimeout(() => {
                onSubmit(processedData);
            }, 1500);
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black/90 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            
            <div className="flex w-full max-w-6xl bg-black/60 rounded-2xl overflow-hidden shadow-2xl border border-orange-500/20">
                {/* Form Section */}
                <div className="w-full md:w-2/3 p-8 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold text-white text-center mb-4">
                            Edit Your Profile
                        </h2>
                        <p className="text-center text-gray-400 mb-6">
                            Update your fitness journey details
                        </p>
                    </motion.div>

                    {feedback && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-6"
                        >
                            <Feedback
                                type={feedback.type}
                                message={feedback.message}
                                onClose={() => setFeedback(null)}
                            />
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'fullName', label: 'Full Name', type: 'text' },
                                { name: 'age', label: 'Age', type: 'number' },
                                { name: 'weight', label: 'Weight (kg)', type: 'number' },
                                { name: 'height', label: 'Height (cm)', type: 'number' }
                            ].map((field, index) => (
                                <motion.div
                                    key={field.name}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </motion.div>
                            ))}

                            {/* Gender and Fitness Level Dropdowns */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="" className="bg-black text-white">Select gender</option>
                                    <option value="male" className="bg-black text-white">Male</option>
                                    <option value="female" className="bg-black text-white">Female</option>
                                    <option value="other" className="bg-black text-white">Other</option>
                                </select>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="block text-sm font-medium text-gray-300 mb-2">Fitness Level</label>
                                <select
                                    name="fitnessLevel"
                                    value={formData.fitnessLevel}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="beginner" className="bg-black text-white">Beginner</option>
                                    <option value="intermediate" className="bg-black text-white">Intermediate</option>
                                    <option value="advanced" className="bg-black text-white">Advanced</option>
                                </select>
                            </motion.div>
                        </div>

                        {/* Fitness Goals */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="block text-sm font-medium text-gray-300 mb-2">
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
                                        className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                            formData.fitnessGoals.includes(goal.value)
                                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    >
                                        <span>{goal.icon}</span>
                                        <span>{goal.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Activity Preferences */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <label className="block text-sm font-medium text-gray-300 mb-2">
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
                                        className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                            formData.activityPreferences.includes(activity.value)
                                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    >
                                        <span>{activity.icon}</span>
                                        <span>{activity.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Form Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex justify-end space-x-3"
                        >
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg text-white transition-all duration-300 
                                    ${loading 
                                        ? 'bg-gray-700 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                                    }`}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </motion.div>
                    </form>
                </div>

                {/* Transformation Insight Panel */}
                <motion.div 
                    className="hidden md:flex w-1/3 bg-gradient-to-br from-red-500 to-orange-500 p-8 items-center justify-center"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center text-white">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentInsight}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="text-xl font-bold"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                </svg>
                                &quot;{currentInsight}&quot;
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
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