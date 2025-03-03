import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const AchievementPopup = ({ achievement, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-gradient-to-br from-black to-blue-950/30 p-8 rounded-xl border border-blue-500/20 max-w-md w-full mx-4"
            >
                <div className="text-center">
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 1 }}
                        className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center"
                    >
                        <span className="text-3xl">🏆</span>
                    </motion.div>
                    <h2 className="mt-4 text-2xl font-bold text-white">Achievement Unlocked!</h2>
                    <p className="mt-2 text-xl text-blue-400">{achievement.name}</p>
                    <p className="mt-2 text-gray-400">{achievement.description}</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg"
                    >
                        Awesome!
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

AchievementPopup.propTypes = {
    achievement: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
    }).isRequired,
    onClose: PropTypes.func.isRequired
};

export default AchievementPopup;