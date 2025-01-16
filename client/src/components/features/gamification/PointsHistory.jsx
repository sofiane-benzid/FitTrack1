import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const PointsHistory = ({ history }) => {
    return (
        <div className="bg-black/40 rounded-xl border border-orange-500/20 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Points History</h3>
            <div className="space-y-3">
                {history.map((entry, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex justify-between items-center bg-black/20 p-3 rounded-lg"
                    >
                        <span className="text-orange-200">{entry.reason}</span>
                        <span className="text-orange-400">+{entry.amount}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

PointsHistory.propTypes = {
    history: PropTypes.arrayOf(
        PropTypes.shape({
            amount: PropTypes.number.isRequired,
            reason: PropTypes.string.isRequired
        })
    ).isRequired
};

export default PointsHistory;