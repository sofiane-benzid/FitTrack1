import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Feedback from '../components/common/Feedback';
import PageHeader from '../components/common/PageHeader';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
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

  const fitnessGoalsOptions = [
    'weight_loss',
    'muscle_gain',
    'endurance',
    'flexibility',
    'general_fitness'
  ];

  const activityOptions = [
    'running',
    'walking',
    'cycling',
    'swimming',
    'weightlifting',
    'yoga',
    'other'
  ];

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        fullName: user.profile.fullName || '',
        age: user.profile.age || '',
        weight: user.profile.weight || '',
        height: user.profile.height || '',
        gender: user.profile.gender || '',
        fitnessLevel: user.profile.fitnessLevel || 'beginner',
        fitnessGoals: user.profile.fitnessGoals || [],
        activityPreferences: user.profile.activityPreferences || []
      });
    }
  }, [user]);

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

  // Add function to fetch profile
  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (data.profile) {
        setFormData({
          fullName: data.profile.fullName || '',
          age: data.profile.age || '',
          weight: data.profile.weight || '',
          height: data.profile.height || '',
          gender: data.profile.gender || '',
          fitnessLevel: data.profile.fitnessLevel || 'beginner',
          fitnessGoals: data.profile.fitnessGoals || [],
          activityPreferences: data.profile.activityPreferences || []
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Failed to load profile'
      });
    }
  };

  // Add useEffect to fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('http://localhost:5000/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ profile: formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      updateProfile(formData);
      
      setFeedback({
        type: 'success',
        message: 'Profile updated successfully!'
      });
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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader title="Edit Profile" />

        {feedback && (
          <div className="mb-6">
            <Feedback
              type={feedback.type}
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
                    key={goal}
                    type="button"
                    onClick={() => handleMultiSelect('fitnessGoals', goal)}
                    className={`p-2 rounded-md text-sm font-medium transition-colors ${
                      formData.fitnessGoals.includes(goal)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                    key={activity}
                    type="button"
                    onClick={() => handleMultiSelect('activityPreferences', activity)}
                    className={`p-2 rounded-md text-sm font-medium transition-colors ${
                      formData.activityPreferences.includes(activity)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {activity.charAt(0).toUpperCase() + activity.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } px-4 py-2 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;