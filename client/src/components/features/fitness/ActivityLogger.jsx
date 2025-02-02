import { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import ThemedDatePicker from '../../common/ThemedDatePicker';

const ActivityLogger = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    type: 'running',
    duration: '',
    distance: '',
    calories: '',
    notes: '',
    date: new Date().toISOString().split('T')[0] || '', // Ensure it's always a string
    isShared: true, // Default to true for better partner engagement
    visibility: 'partners', // Default to partners
    sets: []
  });
  const [currentSet, setCurrentSet] = useState({
    exercise: '',
    weight: '',
    reps: ''
  });
  const [loading, setLoading] = useState(false);

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
    }
  };

  const removeSet = (index) => {
    setFormData(prev => ({
      ...prev,
      sets: prev.sets.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/activity/log', {
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
        sets: []
      });

      onSuccess?.();
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-orange-200 mb-1">Activity Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                      focus:border-red-500/50 focus:ring-0 transition-colors"
            required
          >
            {activityTypes.map(type => (
              <option key={type.value} className="bg-black text-white" value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-orange-200 mb-1">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                     focus:border-red-500/50 focus:ring-0 transition-colors"
            required
          />
        </div>

        {activityTypes.find(t => t.value === formData.type)?.needsDistance && (
          <div>
            <label className="block text-sm font-medium text-orange-200 mb-1">Distance (km)</label>
            <input
              type="number"
              step="0.01"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                       focus:border-red-500/50 focus:ring-0 transition-colors"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-orange-200 mb-1">Calories (optional)</label>
          <input
            type="number"
            name="calories"
            value={formData.calories}
            onChange={handleChange}
            className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                     focus:border-red-500/50 focus:ring-0 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-orange-200 mb-1">Date</label>
          <ThemedDatePicker
            selectedDate={formData.date}
            onDateChange={(date) => setFormData(prev => ({
              ...prev,
              date: date
            }))}
            minDate={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {formData.type === 'weightlifting' && (
        <div className="space-y-4">
          <div className="bg-black/20 p-4 rounded-lg border border-red-500/10">
            <h3 className="text-lg font-medium text-orange-200 mb-4">Add Set</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Exercise"
                name="exercise"
                value={currentSet.exercise}
                onChange={handleSetChange}
                className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                         focus:border-red-500/50 focus:ring-0 transition-colors"
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                name="weight"
                value={currentSet.weight}
                onChange={handleSetChange}
                className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                         focus:border-red-500/50 focus:ring-0 transition-colors"
              />
              <input
                type="number"
                placeholder="Reps"
                name="reps"
                value={currentSet.reps}
                onChange={handleSetChange}
                className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                         focus:border-red-500/50 focus:ring-0 transition-colors"
              />
            </div>
            <motion.button
              type="button"
              onClick={addSet}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full mt-4 p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 
                       text-orange-200 rounded-lg hover:from-red-500/30 hover:to-orange-500/30
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
                           border border-red-500/10"
                >
                  <div className="flex-1">
                    <span className="text-orange-200">{set.exercise}: </span>
                    <span className="text-orange-200/70">{set.weight}kg × {set.reps} reps</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSet(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
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
        <label className="block text-sm font-medium text-orange-200 mb-1">Notes (optional)</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full bg-black/20 border border-red-500/20 rounded-lg text-orange-200
                   focus:border-red-500/50 focus:ring-0 transition-colors"
        ></textarea>
      </div>

      {/* Sharing Options */}
      <div className="space-y-4 border-t border-orange-500/20 pt-4 mt-4">
        <h3 className="text-sm font-medium text-orange-200">Sharing Options</h3>
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
            className="rounded border-orange-500/20 bg-black/40 text-orange-500 
                 focus:ring-orange-500 focus:ring-offset-0"
          />
          <label htmlFor="isShared" className="text-orange-200">
            Share with workout partner
          </label>
        </div>

        {formData.isShared && (
          <div>
            <label className="block text-sm font-medium text-orange-200 mb-1">
              Visibility
            </label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                visibility: e.target.value
              }))}
              className="w-full bg-black/40 border border-orange-500/20 rounded-lg px-4 py-2 
                   text-orange-200 focus:border-orange-500 focus:ring-0"
            >
              <option value="partners" className="bg-black">Workout Partners Only</option>
              <option value="friends" className="bg-black">All Friends</option>
              <option value="public" className="bg-black">Public</option>
            </select>
            <p className="mt-1 text-sm text-orange-200/70">
              Choose who can see this activity
            </p>
          </div>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`w-full py-3 rounded-lg text-white font-medium
                   ${loading ? 'bg-red-500/50' : 'bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-lg hover:shadow-red-500/20'}
                   transition-all duration-300`}
      >
        {loading ? 'Logging Activity...' : 'Log Activity'}
      </motion.button>
    </form>
  );
};

ActivityLogger.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};

export default ActivityLogger;