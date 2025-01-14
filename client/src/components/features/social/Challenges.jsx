import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socialService } from '../../../services/socialService';
import Feedback from '../../common/Feedback';

const Challenge = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target: '',
        endDate: '',
        participantIds: []
    });

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const data = await socialService.getChallenges();
            setChallenges(data);
        } catch (err) {
            setError('Failed to load challenges');
            console.error('Error fetching challenges:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await socialService.createChallenge(formData);
            setShowCreateForm(false);
            setFormData({
                title: '',
                description: '',
                target: '',
                endDate: '',
                participantIds: []
            });
            fetchChallenges();
        } catch (err) {
            setError('Failed to create challenge'+err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[200px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && <Feedback type="error" message={error} />}

            {/* Create Challenge Button */}
            <div className="flex justify-end">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors"
                >
                    Create Challenge
                </motion.button>
            </div>

            {/* Create Challenge Form */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
                    >
                        <motion.div 
                            className="bg-black/60 rounded-xl shadow-lg overflow-hidden border border-orange-500/20 max-w-md w-full"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="p-6 border-b border-orange-500/20">
                                <h3 className="text-xl font-bold text-white">Create Challenge</h3>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Target (number)</label>
                                    <input
                                        type="number"
                                        value={formData.target}
                                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-2">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-4 py-2 bg-black/40 text-white rounded-lg hover:bg-black/60 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors"
                                    >
                                        Create
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Challenges List */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 rounded-xl shadow-lg overflow-hidden border border-orange-500/20"
            >
                <div className="p-6 border-b border-orange-500/20">
                    <h2 className="text-xl font-bold text-white">Active Challenges</h2>
                </div>

                <ul className="divide-y divide-orange-500/10">
                    {challenges.length === 0 ? (
                        <li className="p-6 text-center text-gray-400">
                            No active challenges
                        </li>
                    ) : (
                        challenges.map((challenge) => (
                            <motion.li
                                key={challenge._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-6 hover:bg-white/5 transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-white font-medium">{challenge.title}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>
                                        <div className="mt-2 text-sm text-gray-400">
                                            Target: {challenge.target} | Ends: {new Date(challenge.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-orange-300">
                                            Active
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            {challenge.participants.length} participants
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3">
                                    <div className="relative pt-1">
                                        <div className="overflow-hidden h-2 text-xs flex rounded bg-white/10">
                                            <div
                                                style={{ width: `${(challenge.currentProgress / challenge.target) * 100}%` }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-red-500 to-orange-500"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.li>
                        ))
                    )}
                </ul>
            </motion.div>
        </div>
    );
};

export default Challenge;