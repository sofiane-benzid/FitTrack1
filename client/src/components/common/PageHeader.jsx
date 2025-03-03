import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({ title, showBack = true, previousPage = -1 }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mb-6 space-x-4"
        >
            {showBack && (
                <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(previousPage)}
                    className="p-2 rounded-full bg-black/20 border border-blue-500/20 transition-colors"
                    aria-label="Go back"
                >
                    <svg
                        className="w-6 h-6 text-neutral-200"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                </motion.button>
            )}
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent"
            >
                {title}
            </motion.h1>
        </motion.div>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    showBack: PropTypes.bool,
    previousPage: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ])
};

export default PageHeader;