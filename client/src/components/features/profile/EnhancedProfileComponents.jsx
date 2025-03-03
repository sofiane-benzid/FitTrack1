import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState } from 'react';

const AnimatedAchievementCard = ({ achievement, index }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 300
            }}
            whileHover={{
                scale: 1.05,
                rotate: Math.random() * 2 - 1 // Subtle random rotation
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative bg-black/40 rounded-lg overflow-hidden border border-blue-500/20 transform transition-all duration-300"
        >
            <div className="px-4 py-5 sm:p-6">
                <h4 className="text-lg font-medium text-white">{achievement.name}</h4>
                <p className="mt-1 text-sm text-gray-400">{achievement.description}</p>

                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-500/30 flex items-center justify-center"
                        >
                            <p className="text-white text-sm text-center">
                                Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const InteractiveProgressBar = ({ label, value, maxValue }) => {
    const progress = Math.min(value / maxValue, 1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            className="flex items-center space-x-4 mb-4"
        >
            <div className="w-1/4 text-white text-sm">{label}</div>
            <div className="flex-grow bg-black/30 rounded-full h-4 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{
                        type: "spring",
                        stiffness: 100
                    }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
                />
            </div>
            <div className="w-1/4 text-white text-sm text-right">{value}</div>
        </motion.div>
    );
};

const ParticleBackground = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            className="fixed inset-0 pointer-events-none z-0"
        >
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        scale: Math.random()
                    }}
                    animate={{
                        x: [
                            Math.random() * window.innerWidth,
                            Math.random() * window.innerWidth
                        ],
                        y: [
                            Math.random() * window.innerHeight,
                            Math.random() * window.innerHeight
                        ],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 5,
                        repeat: Infinity,
                        repeatType: "mirror"
                    }}
                    className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-blue-500/50 to-blue-500/50"
                />
            ))}
        </motion.div>
    );
};
AnimatedAchievementCard.propTypes = {
    achievement: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        earnedAt: PropTypes.string.isRequired
    }).isRequired,
    index: PropTypes.number.isRequired
};

InteractiveProgressBar.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired
};

export { AnimatedAchievementCard, InteractiveProgressBar, ParticleBackground };

