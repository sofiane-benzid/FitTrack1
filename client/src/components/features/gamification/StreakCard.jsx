import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const StreakCard = ({ currentStreak, bestStreak }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-black/40 rounded-xl border border-blue-500/20 p-6"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-white">Current Streak</h3>
                    <motion.p
                        className="text-3xl font-bold text-blue-400"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5 }}
                    >
                        {currentStreak} days
                    </motion.p>
                </div>
                <div className="text-right">
                    <h3 className="text-sm font-medium text-gray-400">Best Streak</h3>
                    <p className="text-xl font-bold text-neutral-200">{bestStreak} days</p>
                </div>
            </div>
            <div className="mt-4">
                {currentStreak > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-neutral-300"
                    >
                        Keep it up! You&apos;re on fire! 🔥
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

StreakCard.propTypes = {
    currentStreak: PropTypes.number.isRequired,
    bestStreak: PropTypes.number.isRequired
};

export default StreakCard;