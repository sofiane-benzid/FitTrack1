import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          setUser(parsedUser);
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (userData, token) => {
    try {

      
      if (!token) {
        throw new Error('No token provided');
      }

      if (!userData || !userData.email) {
        throw new Error('Invalid user data');
      }

      // Ensure user data has the required structure
      const normalizedUserData = {
        id: userData.id || userData.userId, // Handle both formats
        email: userData.email,
        profile: userData.profile || {},
        fitness: userData.fitness || {
          weeklyGoal: {
            workouts: 3,
            minutes: 150
          },
          statistics: {
            totalWorkouts: 0,
            totalMinutes: 0,
            totalCalories: 0,
            workoutStreak: 0
          }
        }
      };

      setUser(normalizedUserData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUserData));

    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = (profileData) => {
    try {
      if (!user) {
        throw new Error('No user found');
      }
      
      const updatedUser = {
        ...user,
        profile: { ...user.profile, ...profileData }
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
