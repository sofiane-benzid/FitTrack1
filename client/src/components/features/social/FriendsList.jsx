import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { socialService } from '../../../services/socialService';
import Feedback from '../../common/Feedback';
import { UserProfileModal } from './UserModals';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);


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

  const handleViewProfile = (friend) => {
    setSelectedUser(friend);
    setShowProfileModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 rounded-xl shadow-lg overflow-hidden border border-blue-500/20"
      >
        <div className="p-6 border-b border-blue-500/20">
          <h2 className="text-xl font-bold text-white">Your Friends</h2>
        </div>

        <ul className="divide-y divide-blue-500/10">
          {friends.length === 0 ? (
            <li className="p-6 text-center text-gray-400">
              No friends added yet
            </li>
          ) : (
            friends.map((friend) => (
              <motion.li
                key={friend._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {friend.fullName?.charAt(0) || friend.email.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {friend.fullName || 'No name set'}
                      </h3>
                      <p className="text-sm text-gray-400">{friend.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewProfile(friend)}
                      className="px-4 py-2 bg-black/40 text-white rounded-lg hover:bg-black/60 transition-colors"
                    >
                      View Profile
                    </motion.button>
                  </div>
                </div>
              </motion.li>
            ))
          )}
        </ul>
      </motion.div>

      {showProfileModal && selectedUser && (
        <UserProfileModal
          userId={selectedUser._id}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedUser(null);
          }}
        />
      )}


    </div>
  );
};

export default FriendsList;