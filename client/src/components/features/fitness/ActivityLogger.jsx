import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { API_BASE_URL } from '../../../../../server/config/env';
import Feedback from '../../common/Feedback';
import ThemedDatePicker from '../../common/ThemedDatePicker';
import LiveExerciseTimer from './LiveExerciseTimer';

const ActivityLogger = ({ onSuccess, onError, onWorkoutComplete }) => {
  const [formData, setFormData] = useState({
    type: 'running',
    duration: '',
    distance: '',
    calories: '',
    notes: '',
    date: new Date().toISOString().split('T')[0] || '',
    isShared: true,
    visibility: 'partners',
    sets: []
  });
  const [currentSet, setCurrentSet] = useState({
    exercise: '',
    weight: '',
    reps: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showLiveTimer, setShowLiveTimer] = useState(false);
  const [liveTimerInitiated, setLiveTimerInitiated] = useState(false);

  const activityTypes = [
    { value: 'running', label: 'Running', needsDistance: true },
    { value: 'walking', label: 'Walking', needsDistance: true },
    { value: 'cycling', label: 'Cycling', needsDistance: true },
    { value: 'swimming', label: 'Swimming', needsDistance: true },
    { value: 'weightlifting', label: 'Weight Training', needsDistance: false },
    { value: 'yoga', label: 'Yoga', needsDistance: false },
    { value: 'other', label: 'Other', needsDistance: false }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSetChange = (e) => {
    const { name, value } = e.target;
    setCurrentSet(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSet = () => {
    if (currentSet.exercise && currentSet.weight && currentSet.reps) {
      setFormData(prev => ({
        ...prev,
        sets: [...prev.sets, {
          ...currentSet,
          weight: Number(currentSet.weight),
          reps: Number(currentSet.reps)
        }]
      }));
      setCurrentSet({ exercise: '', weight: '', reps: '' });
      setFeedback({
        type: 'success',
        message: 'Set added successfully!'
      });

      // Auto-dismiss feedback after 3 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    } else {
      setFeedback({
        type: 'error',
        message: 'Please fill all set fields'
      });

      // Auto-dismiss feedback after 3 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    }
  };

  const removeSet = (index) => {
    setFormData(prev => ({
      ...prev,
      sets: prev.sets.filter((_, i) => i !== index)
    }));
    setFeedback({
      type: 'info',
      message: 'Set removed'
    });

    // Auto-dismiss feedback after 3 seconds
    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/activity/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          duration: Number(formData.duration),
          distance: formData.distance ? Number(formData.distance) : undefined,
          calories: formData.calories ? Number(formData.calories) : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }

      setFormData({
        type: 'running',
        duration: '',
        distance: '',
        calories: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        isShared: true,
        visibility: 'partners',
        sets: []
      });

      setFeedback({
        type: 'success',
        message: 'Activity logged successfully!'
      });

      onSuccess?.();

      // Auto-dismiss feedback after 3 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Failed to log activity'
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const startLiveTimer = () => {
    // No longer validating duration - we start from 0
    setShowLiveTimer(true);
    setLiveTimerInitiated(true);
    setFeedback({
      type: 'info',
      message: 'Timer started! Keep going!'
    });

    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };

  const handleTimerComplete = (stats) => {
    // When timer completes, we use the measured duration
    setFormData(prev => ({
      ...prev,
      duration: stats.duration.toString(),
      calories: stats.calories.toString(),
      distance: stats.distance > 0 ? stats.distance.toString() : prev.distance
    }));

    setShowLiveTimer(false);

    // Provide workout summary for review if onWorkoutComplete is available
    if (onWorkoutComplete) {
      const workoutData = {
        ...formData,
        duration: stats.duration,
        calories: stats.calories,
        distance: stats.distance > 0 ? stats.distance : undefined
      };
      onWorkoutComplete(workoutData);
    } else {
      // Otherwise show feedback
      setFeedback({
        type: 'success',
        message: 'Workout complete! Review and save your activity.'
      });

      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    }
  };

  const handleCancelTimer = () => {
    setShowLiveTimer(false);
    setFeedback({
      type: 'info',
      message: 'Timer canceled'
    });

    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };

  const handleTimerPause = () => {
    setFeedback({
      type: 'info',
      message: 'Timer paused'
    });

    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };

  const handleTimerResume = () => {
    setFeedback({
      type: 'info',
      message: 'Timer resumed'
    });

    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };

  const handleUpdateStats = (stats) => {
    // This just updates internal state but doesn't show UI feedback
    // to avoid too many notifications
    setFormData(prev => ({
      ...prev,
      duration: stats.duration.toString(),
      calories: stats.calories.toString(),
      distance: stats.distance > 0 ? stats.distance.toString() : prev.distance
    }));
  };

  return (
    <>
      <AnimatePresence>
        {feedback && (
          <div className="mb-4">
            <Feedback
              type={feedback.type}
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {showLiveTimer ? (
        <LiveExerciseTimer
          isActive={showLiveTimer}
          onTimerComplete={handleTimerComplete}
          activityType={formData.type}
          onCancel={handleCancelTimer}
          onPause={handleTimerPause}
          onResume={handleTimerResume}
          onUpdateStats={handleUpdateStats}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Activity Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-black/20 border border-blue-500/20 rounded-lg text-blue-200
                          focus:border-blue-500/50 focus:ring-0 transition-colors"
                required
              >
                {activityTypes.map(type => (
                  <option key={type.value} className="bg-black text-white" value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Date</label>
              <ThemedDatePicker
                selectedDate={formData.date}
                onDateChange={(date) => setFormData(prev => ({
                  ...prev,
                  date: date
                }))}
              />
            </div>

            {/* Optional manual inputs - can be used if user wants to log directly */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Duration (minutes) <span className="text-xs text-blue-200/50">optional</span></label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Or use live timer below"
                className="w-full bg-black/20 border border-blue-500/20 rounded-lg text-blue-200
                         focus:border-blue-500/50 focus:ring-0 transition-colors"
              />
            </div>

            {activityTypes.find(t => t.value === formData.type)?.needsDistance && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">Distance (km) <span className="text-xs text-blue-200/50">optional</span></label>
                <input
                  type="number"
                  step="0.01"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  placeholder="Auto-calculated with timer"
                  className="w-full bg-black/20 border border-blue-500/20 rounded-lg text-blue-200
                           focus:border-blue-500/50 focus:ring-0 transition-colors"
                />
              </div>
            )}

            {/* Live Timer Button - 2 column span */}
            <div className="col-span-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startLiveTimer}
                disabled={liveTimerInitiated && loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-500 
                          text-white font-medium hover:from-blue-600 hover:to-blue-600
                          disabled:from-gray-500/50 disabled:to-gray-500/50 disabled:text-gray-300
                          transition-all duration-300"
              >
                {loading ? 'Please wait...' : 'Start Live Timer'}
              </motion.button>
              <p className="mt-2 text-xs text-center text-blue-200/70">
                Track your workout in real-time with the timer
              </p>
            </div>
          </div>

          {formData.type === 'weightlifting' && (
            <div className="space-y-4">
              <div className="bg-black/20 p-4 rounded-lg border border-blue-500/10">
                <h3 className="text-lg font-medium text-blue-200 mb-4">Add Set</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Exercise"
                    name="exercise"
                    value={currentSet.exercise}
                    onChange={handleSetChange}
                    className="w-full bg-black/20 border border-blue-500/20 rounded-lg text-blue-200
                             focus:border-blue-500/50 focus:ring-0 transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    name="weight"
                    value={currentSet.weight}
                    onChange={handleSetChange}
                    className="w-full bg-black/20 border border-blue-500/20 rounded-lg text-blue-200
                             focus:border-blue-500/50 focus:ring-0 transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    name="reps"
                    value={currentSet.reps}
                    onChange={handleSetChange}
                    className="w-full bg-black/20 border border-blue-500/20 rounded-lg text-blue-200
                             focus:border-blue-500/50 focus:ring-0 transition-colors"
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={addSet}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full mt-4 p-2 bg-gradient-to-r from-blue-500/20 to-blue-500/20 
                           text-blue-200 rounded-lg hover:from-blue-500/30 hover:to-blue-500/30
                           transition-colors"
                >
                  Add Set
                </motion.button>
              </div>

              {formData.sets.length > 0 && (
                <div className="space-y-2">
                  {formData.sets.map((set, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center bg-black/20 p-3 rounded-lg 
                               border border-blue-500/10"
                    >
                      <div className="flex-1">
                        <span className="text-blue-200">{set.exercise}: </span>
                        <span className="text-blue-200/70">{set.weight}kg × {set.reps} reps</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSet(index)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full bg-black/20 border border-blue-500/20 rounded-lg text-blue-200
                       focus:border-blue-500/50 focus:ring-0 transition-colors"
            ></textarea>
          </div>

          {/* Sharing Options */}
          <div className="space-y-4 border-t border-blue-500/20 pt-4 mt-4">
            <h3 className="text-sm font-medium text-blue-200">Sharing Options</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isShared"
                name="isShared"
                checked={formData.isShared}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  isShared: e.target.checked
                }))}
                className="rounded border-blue-500/20 bg-black/40 text-blue-500 
                     focus:ring-blue-500 focus:ring-offset-0"
              />
              <label htmlFor="isShared" className="text-blue-200">
                Share with workout partner
              </label>
            </div>

            {formData.isShared && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    visibility: e.target.value
                  }))}
                  className="w-full bg-black/40 border border-blue-500/20 rounded-lg px-4 py-2 
                       text-blue-200 focus:border-blue-500 focus:ring-0"
                >
                  <option value="partners" className="bg-black">Workout Partners Only</option>
                  <option value="friends" className="bg-black">All Friends</option>
                  <option value="public" className="bg-black">Public</option>
                </select>
                <p className="mt-1 text-sm text-blue-200/70">
                  Choose who can see this activity
                </p>
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading || (!formData.duration && !liveTimerInitiated)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full py-3 rounded-lg text-white font-medium
                      ${loading ? 'bg-blue-500/50' :
                !formData.duration && !liveTimerInitiated ?
                  'bg-blue-500/30 cursor-not-allowed' :
                  'bg-gradient-to-r from-blue-500 to-blue-500 hover:shadow-lg hover:shadow-blue-500/20'}
                      transition-all duration-300`}
          >
            {loading ? 'Logging Activity...' : 'Log Activity'}
          </motion.button>
        </form>
      )}
    </>
  );
};

ActivityLogger.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  onWorkoutComplete: PropTypes.func
};

export default ActivityLogger;