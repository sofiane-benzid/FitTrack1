import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import Feedback from '../../common/Feedback';
import ThemedDatePicker from '../../common/ThemedDatePicker';




const ProgressUpdateModal = ({ challenge, onClose, onUpdate }) => {
    const { user } = useAuth();
    const userProgress = challenge.participants.find(p => p.user._id === user?.id)?.progress || 0;
    const [progress, setProgress] = useState(userProgress);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onUpdate(challenge._id, progress);
        setLoading(false);
    };

    ProgressUpdateModal.propTypes = {
        challenge: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        onUpdate: PropTypes.func.isRequired,
    };

    const progressPercentage = (progress / challenge.target) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-black/90 p-6 rounded-xl border border-orange-500/20 max-w-md w-full"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-white mb-4">Update Progress</h3>
                <p className="text-orange-200 mb-6">{challenge.title}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-orange-200/70">
                            <span>{progress} completed</span>
                            <span>Target: {challenge.target}</span>
                        </div>
                        <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-orange-500/20">
                            <motion.div
                                initial={{ width: `${(userProgress / challenge.target) * 100}%` }}
                                animate={{ width: `${progressPercentage}%` }}
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Progress Controls */}
                    <div className="space-y-4">
                        {/* Increment/Decrement Buttons */}
                        <div className="flex justify-center items-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => setProgress(Math.max(0, progress - 1))}
                                className="w-12 h-12 rounded-full bg-black/40 border border-orange-500/20 text-orange-200 flex items-center justify-center"
                            >
                                -
                            </motion.button>

                            <div className="relative">
                                <input
                                    type="number"
                                    value={progress}
                                    onChange={(e) => setProgress(Math.max(0, Math.min(challenge.target, Number(e.target.value))))}
                                    className="w-24 text-center bg-black/40 border border-orange-500/20 rounded-lg py-2 text-orange-200 focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => setProgress(Math.min(challenge.target, progress + 1))}
                                className="w-12 h-12 rounded-full bg-black/40 border border-orange-500/20 text-orange-200 flex items-center justify-center"
                            >
                                +
                            </motion.button>
                        </div>

                        {/* Quick Set Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {[25, 50, 75, 100].map(percent => (
                                <motion.button
                                    key={percent}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => setProgress(Math.round((challenge.target * percent) / 100))}
                                    className="px-2 py-1 bg-black/40 border border-orange-500/20 rounded-md text-sm text-orange-200 hover:bg-black/60"
                                >
                                    {percent}%
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-black/40 text-white rounded-lg hover:bg-black/60"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                        >
                            {loading ? 'Updating...' : 'Update Progress'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};



const Challenges = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [setError] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'workout',
        target: '',
        endDate: ''
    });

    const [challenges, setChallenges] = useState({
        active: [],
        available: []
    });

    const [selectedChallenge, setSelectedChallenge] = useState(null);
    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const response = await fetch('http://localhost:5000/social/challenges', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch challenges');
            const data = await response.json();

            // Split challenges into active and available
            const active = data.filter(challenge =>
                challenge.participants.some(p => p.user._id === user?.id)
            );
            const available = data.filter(challenge =>
                !challenge.participants.some(p => p.user._id === user?.id)
            );

            setChallenges({ active, available });
        } catch {
            setError('Failed to load challenges. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/social/challenges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to create challenge');

            setFeedback({
                type: 'success',
                message: 'Challenge created successfully!'
            });
            setShowCreateForm(false);
            fetchChallenges();
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleJoinChallenge = async (challengeId) => {
        try {
            const response = await fetch(`http://localhost:5000/social/challenges/${challengeId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to join challenge');

            setFeedback({
                type: 'success',
                message: 'Successfully joined the challenge!'
            });
            fetchChallenges();
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.message
            });
        }
    };

    const handleUpdateProgress = async (challengeId, newProgress) => {
        try {
            const response = await fetch(`http://localhost:5000/social/challenges/${challengeId}/progress`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ progress: Number(newProgress) })
            });

            if (!response.ok) throw new Error('Failed to update progress');

            setFeedback({
                type: 'success',
                message: 'Progress updated successfully!'
            });
            fetchChallenges();
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.message
            });
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {feedback && (
                    <Feedback
                        type={feedback.type}
                        message={feedback.message}
                        onClose={() => setFeedback(null)}
                    />
                )}
            </AnimatePresence>

            {/* Create Challenge Button */}
            <div className="flex justify-end">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                >
                    {showCreateForm ? 'Cancel' : 'Create Challenge'}
                </motion.button>
            </div>

            {/* Create Challenge Form */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-black/40 rounded-xl border border-orange-500/20 p-6"
                    >
                        <form onSubmit={handleCreateChallenge} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Challenge Title"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-black/20 border border-orange-500/20 rounded-lg px-4 py-2 text-white"
                                    required
                                />
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="bg-black/20 border border-orange-500/20 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="workout">Workout</option>
                                    <option value="nutrition">Nutrition</option>
                                    <option value="social">Social</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Target (e.g., number of workouts)"
                                    value={formData.target}
                                    onChange={e => setFormData({ ...formData, target: e.target.value })}
                                    className="bg-black/20 border border-orange-500/20 rounded-lg px-4 py-2 text-white"
                                    required
                                />

                                {/* Replace the original date input with ThemedDatePicker */}
                                <ThemedDatePicker
                                    selectedDate={formData.endDate}
                                    onDateChange={(date) => setFormData({ ...formData, endDate: date })}
                                    minDate={new Date().toISOString().split('T')[0]} // Set minimum date to today
                                />
                            </div>
                            <textarea
                                placeholder="Challenge Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black/20 border border-orange-500/20 rounded-lg px-4 py-2 text-white"
                                rows={3}
                                required
                            />
                            <div className="flex justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg"
                                >
                                    {loading ? 'Creating...' : 'Create Challenge'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Challenges */}
            <div className="bg-black/40 rounded-xl border border-orange-500/20 overflow-hidden">
                <div className="p-6 border-b border-orange-500/20">
                    <h2 className="text-lg font-medium text-white">Active Challenges</h2>
                </div>
                <div className="p-6">
                    {challenges.active.length === 0 ? (
                        <p className="text-center text-gray-400">No active challenges</p>
                    ) : (
                        <div className="space-y-4">
                            {challenges.active.map(challenge => (
                                <motion.div
                                    key={challenge._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-black/20 p-4 rounded-lg border border-orange-500/10"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-white font-medium">{challenge.title}</h3>
                                            <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>

                                            {/* Progress Bar */}
                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between text-sm text-orange-200/70">
                                                    <span>
                                                        {challenge.participants.find(p => p.user._id === user?.id)?.progress || 0} / {challenge.target}
                                                    </span>
                                                    <span>{challenge.type}</span>
                                                </div>
                                                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                                        style={{
                                                            width: `${((challenge.participants.find(p => p.user._id === user?.id)?.progress || 0) / challenge.target) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Update Progress Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedChallenge(challenge)}
                                                className="mt-4 px-4 py-2 bg-black/40 border border-orange-500/20 rounded-lg text-orange-200 text-sm hover:bg-black/60"
                                            >
                                                Update Progress
                                            </motion.button>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            Ends: {new Date(challenge.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Add the Progress Update Modal */}
                            <AnimatePresence>
                                {selectedChallenge && (
                                    <ProgressUpdateModal
                                        challenge={selectedChallenge}
                                        onClose={() => setSelectedChallenge(null)}
                                        onUpdate={handleUpdateProgress}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Available Challenges */}
            <div className="bg-black/40 rounded-xl border border-orange-500/20 overflow-hidden">
                <div className="p-6 border-b border-orange-500/20">
                    <h2 className="text-lg font-medium text-white">Available Challenges</h2>
                </div>
                <div className="p-6">
                    {challenges.available.length === 0 ? (
                        <p className="text-center text-gray-400">No available challenges</p>
                    ) : (
                        <div className="space-y-4">
                            {challenges.available.map(challenge => (
                                <motion.div
                                    key={challenge._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-black/20 p-4 rounded-lg border border-orange-500/10"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-white font-medium">{challenge.title}</h3>
                                            <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>
                                            <div className="mt-2">
                                                <p className="text-sm text-orange-300">
                                                    Target: {challenge.target} | Type: {challenge.type}
                                                </p>
                                                <p className="text-sm text-orange-300">
                                                    Participants: {challenge.participants.length}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="text-sm text-gray-400 mb-2">
                                                Ends: {new Date(challenge.endDate).toLocaleDateString()}
                                            </p>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleJoinChallenge(challenge._id)}
                                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm"
                                            >
                                                Join Challenge
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Challenges;