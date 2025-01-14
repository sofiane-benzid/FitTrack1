import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Fitness facts for side panel
const fitnessFacts = [
    "Regular exercise can increase life expectancy by up to 4.5 years.",
    "Your body has over 600 muscles, each waiting to be strengthened.",
    "Exercising can improve your mood and reduce stress hormones.",
    "Just 30 minutes of daily activity can significantly improve your health.",
    "Physical activity can boost brain function and reduce cognitive decline."
];

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentFact, setCurrentFact] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // Rotate fitness facts
    useEffect(() => {
        const randomFact = fitnessFacts[Math.floor(Math.random() * fitnessFacts.length)];
        setCurrentFact(randomFact);
        const intervalId = setInterval(() => {
            const newFact = fitnessFacts[Math.floor(Math.random() * fitnessFacts.length)];
            setCurrentFact(newFact);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            const userData = {
                id: data.userId,
                email: formData.email,
            };

            login(userData, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/90 py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            <div className="flex w-full max-w-4xl bg-black/60 rounded-2xl overflow-hidden shadow-2xl border border-orange-500/20">
                {/* Fitness Fact Panel */}
                <motion.div
                    className="hidden md:flex w-1/2 bg-gradient-to-br from-red-500 to-orange-500 p-8 items-center justify-center"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center text-white">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentFact}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="text-xl font-bold"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                                {currentFact}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Login Form */}
                <div className="w-full md:w-1/2 p-8 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-center text-3xl font-extrabold text-white">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-400">
                            Continue your fitness journey
                        </p>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2 rounded-lg text-white transition-all duration-300 
                                    ${loading
                                        ? 'bg-gray-700 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                                    }`}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </motion.div>
                    </form>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                    >
                        <Link
                            to="/register"
                            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                        >
                            Don&apos;t have an account? Register here
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;