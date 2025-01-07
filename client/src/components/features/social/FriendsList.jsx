import { useState, useEffect } from 'react';
import { socialService } from '../../../services/socialService';
import Feedback from '../../common/Feedback';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchFriends = async () => {
    try {
      const data = await socialService.getFriends();
      setFriends(data);
    } catch (err) {
      setError('Failed to load friends list');
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <Feedback type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <Feedback
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Friends List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Friends</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {friends.length === 0 ? (
            <li className="p-4 text-center text-gray-500">
              No friends added yet
            </li>
          ) : (
            friends.map((friend) => (
              <li 
                key={friend._id} 
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {friend.fullName?.charAt(0) || friend.email.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {friend.fullName || 'No name set'}
                      </p>
                      <p className="text-sm text-gray-500">{friend.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {/* Add message functionality */}}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Message
                    </button>
                    <button 
                      onClick={() => {/* Add view profile functionality */}}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default FriendsList;