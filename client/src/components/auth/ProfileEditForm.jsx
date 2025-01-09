import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth';
import Feedback from '../common/Feedback';

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
    const { updateProfile } = useAuth();

    const fitnessGoalsOptions = [
        { label: 'Weight Loss', value: 'weight_loss' },
        { label: 'Muscle Gain', value: 'muscle_gain' },
        { label: 'Endurance', value: 'endurance' },
        { label: 'Flexibility', value: 'flexibility' },
        { label: 'General Fitness', value: 'general_fitness' }
    ];

    const activityOptions = [
        { label: 'Running', value: 'running' },
        { label: 'Weight Training', value: 'weightlifting' },
        { label: 'Yoga', value: 'yoga' },
        { label: 'Swimming', value: 'swimming' },
        { label: 'Cycling', value: 'cycling' },
        { label: 'Walking', value: 'walking' }
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
        <div className="p-6">
            {feedback && (
                <div className="mb-6">
                    <Feedback
                        type={feedback.type}
                        message={feedback.message}
                        onClose={() => setFeedback(null)}
                    />
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fitness Level</label>
                        <select
                            name="fitnessLevel"
                            value={formData.fitnessLevel}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                {/* Fitness Goals */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fitness Goals
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {fitnessGoalsOptions.map(goal => (
                            <button
                                key={goal.value}
                                type="button"
                                onClick={() => handleMultiSelect('fitnessGoals', goal.value)}
                                className={`p-2 rounded-md text-sm font-medium transition-colors ${formData.fitnessGoals.includes(goal.value)
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {goal.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Activity Preferences */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Activities
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {activityOptions.map(activity => (
                            <button
                                key={activity.value}
                                type="button"
                                onClick={() => handleMultiSelect('activityPreferences', activity.value)}
                                className={`p-2 rounded-md text-sm font-medium transition-colors ${formData.activityPreferences.includes(activity.value)
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {activity.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
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