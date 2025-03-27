import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { calculateIntensityLevel, getActivityIcon, getCompletionMessage } from '../../../utils/TimerPresetsUtils';

const WorkoutSummary = ({ workout, onClose, onSave }) => {
    // Format the date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Calculate intensity level based on duration and type
    const intensityLevel = calculateIntensityLevel(
        Number(workout.duration),
        workout.type
    );

    // Get activity icon
    const activityIcon = getActivityIcon(workout.type);

    // Get completion message
    const completionMessage = getCompletionMessage(workout.type);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/60 rounded-xl border border-blue-500/20 p-6 space-y-6"
        >
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    className="flex justify-center"
                >
                    <div className="w-16 h-16 flex items-center justify-center text-3xl bg-gradient-to-br from-blue-500/30 to-blue-500/30 
                         rounded-full border-2 border-blue-500/40">
                        {activityIcon}
                    </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-blue-200 mt-4 mb-2">
                    Workout Complete!
                </h2>

                <p className="text-blue-200/70">
                    {completionMessage}
                </p>
            </div>

            <div className="border-t border-b border-blue-500/10 py-4">
                <h3 className="text-lg font-medium text-blue-200 mb-4">
                    Workout Summary
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-200/70">Activity</h4>
                        <p className="text-lg font-medium text-blue-200 capitalize">
                            {workout.type}
                        </p>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-200/70">Duration</h4>
                        <p className="text-lg font-medium text-blue-200">
                            {workout.duration} minutes
                        </p>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-200/70">Calories</h4>
                        <p className="text-lg font-medium text-blue-200">
                            {workout.calories || 0}
                        </p>
                    </div>

                    {workout.distance && (
                        <div className="bg-black/40 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-200/70">Distance</h4>
                            <p className="text-lg font-medium text-blue-200">
                                {workout.distance} km
                            </p>
                        </div>
                    )}

                    <div className="bg-black/40 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-200/70">Intensity</h4>
                        <p className="text-lg font-medium text-blue-200">
                            {intensityLevel}
                        </p>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-200/70">Date</h4>
                        <p className="text-lg font-medium text-blue-200">
                            {formatDate(workout.date)}
                        </p>
                    </div>
                </div>

                {workout.notes && (
                    <div className="mt-4 bg-black/40 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-200/70">Notes</h4>
                        <p className="text-blue-200">{workout.notes}</p>
                    </div>
                )}

                {workout.sets && workout.sets.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-blue-200/70 mb-2">Sets</h4>
                        <div className="space-y-2">
                            {workout.sets.map((set, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center bg-black/40 p-3 rounded-lg"
                                >
                                    <span className="text-blue-200">{set.exercise}</span>
                                    <span className="text-blue-200/70">{set.weight}kg × {set.reps}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between space-x-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="flex-1 py-3 rounded-lg bg-black/40 text-blue-200 border border-blue-500/20
                   hover:bg-black/60 transition-colors"
                >
                    Discard
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSave(workout)}
                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-500 text-white
                   hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                >
                    Save Workout
                </motion.button>
            </div>
        </motion.div>
    );
};

WorkoutSummary.propTypes = {
    workout: PropTypes.shape({
        type: PropTypes.string.isRequired,
        duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        distance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        calories: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        date: PropTypes.string.isRequired,
        notes: PropTypes.string,
        sets: PropTypes.arrayOf(
            PropTypes.shape({
                exercise: PropTypes.string.isRequired,
                weight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
                reps: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
            })
        )
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
};

export default WorkoutSummary;