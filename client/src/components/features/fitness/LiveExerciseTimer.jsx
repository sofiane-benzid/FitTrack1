import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

const LiveExerciseTimer = ({
    isActive,
    onTimerComplete,
    activityType,
    onCancel,
    onPause,
    onResume,
    onUpdateStats
}) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [formattedTime, setFormattedTime] = useState('00:00:00');
    const [isRunning, setIsRunning] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [caloriesBurned, setCaloriesBurned] = useState(0);
    const [distance, setDistance] = useState(0);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const pausedTimeRef = useRef(0);

    // Calculate MET value based on activity type
    const getMETValue = (type) => {
        const metValues = {
            running: 9.8,
            walking: 3.8,
            cycling: 8.0,
            swimming: 7.0,
            weightlifting: 3.5,
            yoga: 2.5,
            other: 4.0
        };
        return metValues[type] || 4.0;
    };

    // Estimate calories burned based on MET, time, and assumed weight
    const calculateCalories = (seconds, activityType) => {
        // Assumed average weight of 70kg if not provided
        const weight = 70;
        const met = getMETValue(activityType);
        // Calories = MET * weight (kg) * time (hours)
        return Math.round((met * weight * (seconds / 3600)));
    };

    // Estimate distance for cardio activities
    const calculateDistance = (seconds, activityType) => {
        // Rough estimates of speed in km/h for different activities
        const speedMap = {
            running: 10, // ~10 km/h
            walking: 5,  // ~5 km/h
            cycling: 20, // ~20 km/h
            swimming: 3  // ~3 km/h
        };

        if (!speedMap[activityType]) return 0;

        // Distance = speed * time (in hours)
        return parseFloat(((speedMap[activityType] * seconds) / 3600).toFixed(2));
    };

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Start timer when component becomes active
    useEffect(() => {
        if (isActive && !isPaused) {
            startTimeRef.current = Date.now() - pausedTimeRef.current;
            setIsRunning(true);
        }
    }, [isActive, isPaused]);

    // Main timer logic
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                const newElapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setElapsedSeconds(newElapsedSeconds);
                setFormattedTime(formatTime(newElapsedSeconds));

                // Update stats every second
                const newCalories = calculateCalories(newElapsedSeconds, activityType);
                const newDistance = calculateDistance(newElapsedSeconds, activityType);

                setCaloriesBurned(newCalories);
                setDistance(newDistance);

                // Update parent component with current stats
                onUpdateStats({
                    duration: Math.ceil(newElapsedSeconds / 60), // Convert to minutes
                    calories: newCalories,
                    distance: newDistance
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, activityType, onUpdateStats]);

    const handlePause = () => {
        clearInterval(timerRef.current);
        setIsRunning(false);
        setIsPaused(true);
        pausedTimeRef.current = Date.now() - startTimeRef.current;
        onPause?.();
    };

    const handleResume = () => {
        startTimeRef.current = Date.now() - pausedTimeRef.current;
        setIsRunning(true);
        setIsPaused(false);
        onResume?.();
    };

    const handleStop = () => {
        clearInterval(timerRef.current);
        setIsRunning(false);

        // Calculate final stats
        const finalStats = {
            duration: Math.max(1, Math.ceil(elapsedSeconds / 60)), // Minimum 1 minute, convert to minutes
            calories: caloriesBurned,
            distance: distance
        };

        onTimerComplete(finalStats);
    };

    const handleCancel = () => {
        clearInterval(timerRef.current);
        setIsRunning(false);
        onCancel();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-black/60 rounded-xl border border-blue-500/20 p-6 space-y-6"
                >
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-blue-200 mb-2">
                            Live {activityType.charAt(0).toUpperCase() + activityType.slice(1)} Tracker
                        </h2>
                        <p className="text-blue-200/70">Keep going! You're doing great!</p>
                    </div>

                    {/* Timer Display */}
                    <div className="flex justify-center">
                        <motion.div
                            animate={{ scale: [1, 1.03, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/20 
                       border-4 border-blue-500/30 flex items-center justify-center"
                        >
                            <span className="text-4xl font-bold text-blue-200">{formattedTime}</span>
                        </motion.div>
                    </div>

                    {/* Stats Display */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-black/40 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-200/70 mb-1">Calories</h3>
                            <p className="text-2xl font-bold text-blue-200">{caloriesBurned}</p>
                        </div>
                        {['running', 'walking', 'cycling', 'swimming'].includes(activityType) && (
                            <div className="bg-black/40 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-200/70 mb-1">Distance (km)</h3>
                                <p className="text-2xl font-bold text-blue-200">{distance}</p>
                            </div>
                        )}
                        {!['running', 'walking', 'cycling', 'swimming'].includes(activityType) && (
                            <div className="bg-black/40 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-200/70 mb-1">Duration (min)</h3>
                                <p className="text-2xl font-bold text-blue-200">{Math.ceil(elapsedSeconds / 60)}</p>
                            </div>
                        )}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex justify-between space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancel}
                            className="flex-1 py-3 rounded-lg bg-black/40 text-blue-400 border border-blue-500/20
                       hover:bg-black/60 transition-colors"
                        >
                            Cancel
                        </motion.button>

                        {isRunning ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePause}
                                className="flex-1 py-3 rounded-lg bg-black/40 text-blue-200 border border-blue-500/20
                         hover:bg-black/60 transition-colors"
                            >
                                Pause
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleResume}
                                className="flex-1 py-3 rounded-lg bg-black/40 text-blue-200 border border-blue-500/20
                         hover:bg-black/60 transition-colors"
                            >
                                Resume
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStop}
                            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-500 text-white
                       hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                        >
                            Complete
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

LiveExerciseTimer.propTypes = {
    isActive: PropTypes.bool.isRequired,
    onTimerComplete: PropTypes.func.isRequired,
    activityType: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onPause: PropTypes.func,
    onResume: PropTypes.func,
    onUpdateStats: PropTypes.func.isRequired
};

export default LiveExerciseTimer;