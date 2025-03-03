import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../../server/config/env';
import { useAuth } from '../../hooks/useAuth';

// Fitness Achievement Quotes
const achievementQuotes = [
  "Every step is a step closer to your best self.",
  "Transformation is not a future event, it's a present activity.",
  "Your body hears everything your mind says. Stay positive.",
  "The only bad workout is the one that didn't happen.",
  "Small progress is still progress."
];

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    weight: '',
    height: '',
    fitnessLevel: 'beginner',
    fitnessGoals: ['general_fitness'],
    activityPreferences: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  // Animated quote rotation
  useEffect(() => {
    const randomQuote = achievementQuotes[Math.floor(Math.random() * achievementQuotes.length)];
    setCurrentQuote(randomQuote);
    const intervalId = setInterval(() => {
      const newQuote = achievementQuotes[Math.floor(Math.random() * achievementQuotes.length)];
      setCurrentQuote(newQuote);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Activity and Goal Options with Icons
  const activityOptions = [
    { label: 'Running', value: 'running', icon: '🏃' },
    { label: 'Weight Training', value: 'weightlifting', icon: '🏋️' },
    { label: 'Yoga', value: 'yoga', icon: '🧘' },
    { label: 'Swimming', value: 'swimming', icon: '🏊' },
    { label: 'Cycling', value: 'cycling', icon: '🚴' },
    { label: 'Walking', value: 'walking', icon: '🚶' }
  ];

  const fitnessGoalsOptions = [
    { label: 'Weight Loss', value: 'weight_loss', icon: '🔥' },
    { label: 'Muscle Gain', value: 'muscle_gain', icon: '💪' },
    { label: 'Endurance', value: 'endurance', icon: '🏁' },
    { label: 'Flexibility', value: 'flexibility', icon: '🤸' },
    { label: 'General Fitness', value: 'general_fitness', icon: '❤️' }
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
      const processedData = {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height)
      };

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ profile: processedData }),
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

  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>

      <div className="flex w-full max-w-5xl bg-black/60 rounded-2xl overflow-hidden shadow-2xl border border-blue-500/20">
        {/* Form Section */}
        <div className="w-full md:w-2/3 p-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Complete Your Profile
            </h2>
            <p className="text-center text-gray-400 mb-6">
              Let&apos;s create a personalized fitness journey for you
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-900/50 border border-blue-500 text-blue-300 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
            </div>

            {/* Fitness Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                    onClick={() => handleGoalToggle(goal.value)}
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
            </motion.div>

            {/* Preferred Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                    onClick={() => handleActivityToggle(activity.value)}
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
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg text-white transition-all duration-300 
                  ${loading
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                  }`}
              >
                {loading ? 'Setting Up Profile...' : 'Complete Profile'}
              </button>
            </motion.div>
          </form>
        </div>

        {/* Motivational Panel */}
        <motion.div
          className="hidden md:flex w-1/3 bg-gradient-to-br from-blue-500 to-blue-700 p-8 items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center text-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-bold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                &quot;{currentQuote}&quot;
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetup;