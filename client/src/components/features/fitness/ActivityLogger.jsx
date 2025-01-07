import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Feedback from '../../common/Feedback';

const ActivityLogger = () => {
  useAuth();
  const [formData, setFormData] = useState({
    type: 'running',
    duration: '',
    distance: '',
    calories: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    // For weightlifting
    sets: []
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [currentSet, setCurrentSet] = useState({ weight: '', reps: '', exercise: '' });

  const activityTypes = [
    { value: 'running', label: 'Running', needsDistance: true },
    { value: 'walking', label: 'Walking', needsDistance: true },
    { value: 'cycling', label: 'Cycling', needsDistance: true },
    { value: 'swimming', label: 'Swimming', needsDistance: true },
    { value: 'weightlifting', label: 'Weight Training', needsDistance: false },
    { value: 'yoga', label: 'Yoga', needsDistance: false },
    { value: 'other', label: 'Other', needsDistance: false }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      // Create submission data
      const submissionData = {
        ...formData,
        // Remove distance if not needed for this activity type
        ...(activityTypes.find(type => type.value === formData.type)?.needsDistance ? {} : { distance: undefined }),
        // Only include sets for weightlifting
        ...(formData.type === 'weightlifting' ? { sets: formData.sets } : { sets: undefined })
      };

      const response = await fetch('http://localhost:5000/activity/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }

      setFeedback({
        type: 'success',
        message: 'Activity logged successfully!'
      });

      // Reset form
      setFormData({
        type: formData.type, // Keep the current activity type
        duration: '',
        distance: '',
        calories: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        sets: []
      });
      setCurrentSet({ weight: '', reps: '', exercise: '' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to log activity'
      });
    } finally {
      setLoading(false);
    }
  };

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
    if (currentSet.weight && currentSet.reps && currentSet.exercise) {
      setFormData(prev => ({
        ...prev,
        sets: [...prev.sets, currentSet]
      }));
      setCurrentSet({ weight: '', reps: '', exercise: '' });
    }
  };

  const removeSet = (index) => {
    setFormData(prev => ({
      ...prev,
      sets: prev.sets.filter((_, i) => i !== index)
    }));
  };

  const getCurrentActivityType = () => {
    return activityTypes.find(type => type.value === formData.type);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      {feedback && (
        <Feedback
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {getCurrentActivityType()?.needsDistance && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
            <input
              type="number"
              step="0.01"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        {formData.type === 'weightlifting' && (
          <div className="space-y-4">
            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-2">Add Set</h3>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Exercise"
                  name="exercise"
                  value={currentSet.exercise}
                  onChange={handleSetChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  name="weight"
                  value={currentSet.weight}
                  onChange={handleSetChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  name="reps"
                  value={currentSet.reps}
                  onChange={handleSetChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={addSet}
                className="mt-2 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                Add Set
              </button>
            </div>

            {formData.sets.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Sets</h3>
                <div className="space-y-2">
                  {formData.sets.map((set, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span>{set.exercise}: {set.weight}kg × {set.reps} reps</span>
                      <button
                        type="button"
                        onClick={() => removeSet(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Calories (optional)</label>
          <input
            type="number"
            name="calories"
            value={formData.calories}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {loading ? 'Logging...' : 'Log Activity'}
        </button>
      </form>
    </div>
  );
};

export default ActivityLogger;