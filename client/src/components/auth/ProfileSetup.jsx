import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    weight: '',
    height: '',
    fitnessLevel: 'beginner',
    fitnessGoals: ['general_fitness'], // Changed to array with default
    activityPreferences: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  // Updated to match backend expectations
  const activityOptions = [
    { label: 'Running', value: 'running' },
    { label: 'Weight Training', value: 'weightlifting' },
    { label: 'Yoga', value: 'yoga' },
    { label: 'Swimming', value: 'swimming' },
    { label: 'Cycling', value: 'cycling' },
    { label: 'Walking', value: 'walking' }
  ];

  const fitnessGoalsOptions = [
    { label: 'Weight Loss', value: 'weight_loss' },
    { label: 'Muscle Gain', value: 'muscle_gain' },
    { label: 'Endurance', value: 'endurance' },
    { label: 'Flexibility', value: 'flexibility' },
    { label: 'General Fitness', value: 'general_fitness' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActivityToggle = (activityValue) => {
    setFormData(prev => ({
      ...prev,
      activityPreferences: prev.activityPreferences.includes(activityValue)
        ? prev.activityPreferences.filter(a => a !== activityValue)
        : [...prev.activityPreferences, activityValue]
    }));
  };

  const handleGoalToggle = (goalValue) => {
    setFormData(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goalValue)
        ? prev.fitnessGoals.filter(g => g !== goalValue)
        : [...prev.fitnessGoals, goalValue]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert numeric strings to numbers
      const processedData = {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height)
      };

      const response = await fetch('http://localhost:5000/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ profile: processedData }), // Wrap in profile object
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      updateProfile(processedData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the JSX remains similar but updated for goals
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Complete Your Profile
          </h2>
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info fields remain the same */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              {/* Other basic fields remain the same */}
            </div>

            {/* Updated Fitness Goals section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Goals (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {fitnessGoalsOptions.map(goal => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => handleGoalToggle(goal.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      formData.fitnessGoals.includes(goal.value)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Updated Activities section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Activities
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {activityOptions.map(activity => (
                  <button
                    key={activity.value}
                    type="button"
                    onClick={() => handleActivityToggle(activity.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      formData.activityPreferences.includes(activity.value)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {activity.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? 'Setting Up Profile...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;