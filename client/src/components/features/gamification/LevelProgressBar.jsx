import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const LevelProgressBar = ({ currentPoints, nextLevelThreshold, level }) => {
    const progress = (currentPoints / nextLevelThreshold) * 100;

    return (
        <div className="relative pt-1">
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-500/20 text-red-400">
                        Level {level}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-orange-200">
                        {currentPoints} / {nextLevelThreshold}
                    </span>
                </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-black/40 mt-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-red-500 to-orange-500"
                />
            </div>
        </div>
    );
};

LevelProgressBar.propTypes = {
    currentPoints: PropTypes.number.isRequired,
    nextLevelThreshold: PropTypes.number.isRequired,
    level: PropTypes.number.isRequired
};

export default LevelProgressBar;