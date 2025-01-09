import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Feedback from '../components/common/Feedback';
import PageHeader from '../components/common/PageHeader';
import ProfileEditForm from '../components/auth/ProfileEditForm';

const ProfilePage = () => {
  useAuth();
  const [loading, setLoading] = useState(true);
  const [ setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [profileData, setProfileData] = useState({
    basic: {
      fullName: '',
      age: '',
      weight: '',
      height: '',
      gender: '',
      fitnessLevel: ''
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
      const response = await fetch('http://localhost:5000/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      
      // Format profile data from /me endpoint structure
      setProfileData({
        basic: {
          fullName: data.profile?.fullName || '',
          age: data.profile?.age || '',
          weight: data.profile?.weight || '',
          height: data.profile?.height || '',
          gender: data.profile?.gender || '',
          fitnessLevel: data.profile?.fitnessLevel || ''
        },
        stats: {
          totalWorkouts: data.fitness?.statistics?.totalWorkouts || 0,
          totalMinutes: data.fitness?.statistics?.totalMinutes || 0,
          totalCalories: data.fitness?.statistics?.totalCalories || 0,
          workoutStreak: data.fitness?.statistics?.workoutStreak || 0,
          points: data.fitness?.statistics?.points || 0
        },
        achievements: data.achievements || [],
        recentActivities: data.activities?.slice(-10) || [] // Get last 10 activities
      });
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Profile data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const response = await fetch('http://localhost:5000/auth/me', {
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
      fetchProfileData(); // Refresh all profile data
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader title="Profile" />
        
        {feedback && (
          <div className="mb-6">
            <Feedback
              type={feedback.type}
              message={feedback.message}
              onClose={() => setFeedback(null)}
            />
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {profileData.basic.fullName || 'No name set'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Level {Math.floor(profileData.stats.totalWorkouts / 10) + 1} Fitness Enthusiast
              </p>
            </div>
            <button
              onClick={() => setShowEditForm(!showEditForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {showEditForm ? 'View Profile' : 'Edit Profile'}
            </button>
          </div>

          {/* Main Content */}
          {!showEditForm ? (
            <>
              {/* Stats Grid */}
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 p-4">
                    {/* Workout Stats */}
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Workouts</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {profileData.stats.totalWorkouts}
                        </dd>
                      </div>
                    </div>
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Workout Streak</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {profileData.stats.workoutStreak} days
                        </dd>
                      </div>
                    </div>
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Minutes</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {profileData.stats.totalMinutes}
                        </dd>
                      </div>
                    </div>
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Points</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {profileData.stats.points}
                        </dd>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Age</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profileData.basic.age || 'Not set'}
                    </dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Height</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profileData.basic.height ? `${profileData.basic.height} cm` : 'Not set'}
                    </dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Weight</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profileData.basic.weight ? `${profileData.basic.weight} kg` : 'Not set'}
                    </dd>
                  </div>
                  <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fitness Level</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                      {profileData.basic.fitnessLevel || 'Not set'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Achievements Section */}
              <div className="border-t border-gray-200">
                <div className="bg-gray-50 px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">Achievements</h3>
                </div>
                <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {profileData.achievements.length > 0 ? (
                    profileData.achievements.map((achievement, index) => (
                      <div key={index} className="bg-gray-50 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <h4 className="text-lg font-medium text-gray-900">{achievement.name}</h4>
                          <p className="mt-1 text-sm text-gray-500">{achievement.description}</p>
                          <p className="mt-2 text-xs text-gray-400">
                            Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-full text-center py-4">
                      No achievements yet. Keep working out to earn some!
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Activities Section */}
              <div className="border-t border-gray-200">
                <div className="bg-gray-50 px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {profileData.recentActivities.length > 0 ? (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {profileData.recentActivities.map((activity, activityIdx) => (
                          <li key={activity._id}>
                            <div className="relative pb-8">
                              {activityIdx !== profileData.recentActivities.length - 1 ? (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                  aria-hidden="true"
                                />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <span className="text-white text-sm capitalize">
                                      {activity.type?.charAt(0)}
                                    </span>
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      {activity.type} • {activity.duration} minutes
                                      {activity.distance && ` • ${activity.distance}km`}
                                      {activity.calories && ` • ${activity.calories} calories`}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    {new Date(activity.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No recent activities. Start working out to see your activity history!
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <ProfileEditForm
              initialData={profileData.basic}
              onSubmit={handleProfileUpdate}
              onCancel={() => setShowEditForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;