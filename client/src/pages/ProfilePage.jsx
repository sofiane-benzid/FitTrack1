import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Feedback from '../components/common/Feedback';
import PageHeader from '../components/common/PageHeader';
import ProfileEditForm from '../components/auth/ProfileEditForm';
import {
  AnimatedAchievementCard,
  ParticleBackground
} from '../components/features/profile/EnhancedProfileComponents';
import { API_BASE_URL } from '../../../server/config/env';

import { QRCodeGenerator } from '../components/common/QRCodeComponents';


const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [profileData, setProfileData] = useState({
    basic: {
      fullName: '',
      age: '',
      weight: '',
      height: '',
      gender: '',
      fitnessLevel: '',
      fitnessGoals: [],
      activityPreferences: []
    },
    stats: {
      totalWorkouts: 0,
      totalMinutes: 0,
      totalCalories: 0,
      workoutStreak: 0,
      points: 0
    },
    achievements: [],
    recentActivities: []
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();


      // Map the received data to our state structure
      setProfileData({
        basic: {
          fullName: data.profile?.fullName || user?.email || 'User',
          age: data.profile?.age || '',
          weight: data.profile?.weight || '',
          height: data.profile?.height || '',
          gender: data.profile?.gender || '',
          fitnessLevel: data.profile?.fitnessLevel || 'beginner',
          fitnessGoals: data.profile?.fitnessGoals || [],  // Add these two lines
          activityPreferences: data.profile?.activityPreferences || []
        },
        stats: {
          totalWorkouts: data.fitness?.statistics?.totalWorkouts || 0,
          totalMinutes: data.fitness?.statistics?.totalMinutes || 0,
          totalCalories: data.fitness?.statistics?.totalCalories || 0,
          workoutStreak: data.fitness?.statistics?.workoutStreak || 0,
          points: data.fitness?.statistics?.points || 0
        },
        achievements: data.achievements || [],
        recentActivities: data.activities?.slice(-10) || []
      });

      setFeedback({
        type: 'success',
        message: 'Profile loaded successfully'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setFeedback({
        type: 'error',
        message: `Failed to load profile: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await fetch(`h${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ profile: updatedData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await response.json();
      setShowEditForm(false);
      setFeedback({
        type: 'success',
        message: 'Profile updated successfully!'
      });

      // Refresh profile data
      fetchProfileData();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message
      });
    }
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-black/90 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-16 h-16 border-4 border-transparent border-b-red-500 rounded-full animate-spin"
          animate={{
            rotate: 360,
            transition: {
              repeat: Infinity,
              duration: 1,
              ease: "linear"
            }
          }}
        />
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black py-6 overflow-hidden">
      <ParticleBackground />

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader title="Profile" className="text-white" />
        </motion.div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <Feedback
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/60 rounded-2xl overflow-hidden border border-orange-500/20 shadow-2xl"
        >
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-orange-500/20">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {profileData.basic.fullName}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Level {Math.floor(profileData.stats.totalWorkouts / 10) + 1} Fitness Enthusiast
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEditForm(!showEditForm)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors"
            >
              {showEditForm ? 'View Profile' : 'Edit Profile'}
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {!showEditForm ? (
              <motion.div
                key="profile-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >

                <div className="border-b border-orange-500/20 py-6 px-4">
                  <h3 className="text-xl font-bold text-white text-center mb-6">
                    Add Friend QR Code
                  </h3>
                  <div className="max-w-sm mx-auto">
                    <QRCodeGenerator userId={user?.id} />
                  </div>
                </div>
                {/* Achievements Section */}
                <div className="border-b border-orange-500/20">
                  <div className="bg-black/40 px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium text-white">Achievements</h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {profileData.achievements.length > 0 ? (
                      profileData.achievements.map((achievement, index) => (
                        <AnimatedAchievementCard
                          key={index}
                          achievement={achievement}
                          index={index}
                        />
                      ))
                    ) : (
                      <p className="text-gray-400 col-span-full text-center py-4">
                        No achievements yet. Keep working out to earn some!
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent Activities Section */}
                <div>
                  <div className="bg-black/40 px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium text-white">Recent Activities</h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    {profileData.recentActivities.length > 0 ? (
                      <motion.ul
                        initial="hidden"
                        animate="visible"
                        className="-mb-8"
                      >
                        {profileData.recentActivities.map((activity, activityIdx) => (
                          <motion.li
                            key={activity._id || activityIdx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              transition: {
                                delay: activityIdx * 0.1,
                                type: "spring",
                                stiffness: 300
                              }
                            }}
                            whileHover={{
                              scale: 1.02,
                              transition: { duration: 0.2 }
                            }}
                            className="relative pb-8 cursor-pointer"
                          >
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                                  <span className="text-white text-sm capitalize">
                                    {activity.type?.charAt(0)}
                                  </span>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-300">
                                    {activity.type} • {activity.duration} minutes
                                    {activity.distance && ` • ${activity.distance}km`}
                                    {activity.calories && ` • ${activity.calories} calories`}
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                  {new Date(activity.date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </motion.ul>
                    ) : (
                      <p className="text-gray-400 text-center py-4">
                        No recent activities. Start working out to see your activity history!
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <ProfileEditForm
                initialData={profileData.basic}
                onSubmit={handleProfileUpdate}
                onCancel={() => setShowEditForm(false)}
              />

            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;