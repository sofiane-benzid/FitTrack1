import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../../server/config/env';
import { useAuth } from '../../hooks/useAuth';

// Motivational quotes for side panel
const motivationalQuotes = [
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "Success is not given. It is earned. On the track, on the field, in the gym. With blood, sweat, and the occasional tear.",
  "The only bad workout is the one that didn't happen.",
  "Pain is temporary. Quitting lasts forever.",
  "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't."
];

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      fullName: '',
      age: '',
      gender: 'other',
      fitnessLevel: 'beginner'
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Rotate motivational quotes
  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setCurrentQuote(randomQuote);
    const intervalId = setInterval(() => {
      const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setCurrentQuote(newQuote);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          profile: formData.profile
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const userData = {
        id: data.userId,
        email: formData.email,
        profile: formData.profile
      };

      await login(userData, data.token);
      navigate('/profile-setup');
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/90 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>
      <div className="flex w-full max-w-5xl bg-black/60 rounded-2xl overflow-hidden shadow-2xl border border-blue-500/20">
        {/* Registration Form */}
        <div className="w-full md:w-1/2 p-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-center text-3xl font-extrabold text-white">
              Create Your Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Start your fitness transformation
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <input
                name="profile.fullName"
                type="text"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full Name"
                value={formData.profile.fullName}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex space-x-4"
            >
              <input
                name="profile.age"
                type="number"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Age"
                value={formData.profile.age}
                onChange={handleChange}
              />
              <select
                name="profile.gender"
                value={formData.profile.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male" className="bg-black text-white">Male</option>
                <option value="female" className="bg-black text-white">Female</option>
                <option value="other" className="bg-black text-white">Other</option>
              </select>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <select
                name="profile.fitnessLevel"
                value={formData.profile.fitnessLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner" className="bg-black text-white">Beginner</option>
                <option value="intermediate" className="bg-black text-white">Intermediate</option>
                <option value="advanced" className="bg-black text-white">Advanced</option>
              </select>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <input
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <input
                name="confirmPassword"
                type="password"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Link
              to="/login"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Already have an account? Sign in here
            </Link>
          </motion.div>
        </div>

        {/* Motivational Quote Panel */}
        <motion.div
          className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 p-8 items-center justify-center"
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

export default Register;