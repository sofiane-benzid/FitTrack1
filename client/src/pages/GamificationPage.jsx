import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import LevelProgressBar from '../components/features/gamification/LevelProgressBar';
import StreakCard from '../components/features/gamification/StreakCard';
import PointsHistory from '../components/features/gamification/PointsHistory';
import AchievementPopup from '../components/features/gamification/AchievementPopup';
import Badges from '../components/features/gamification/Badges';
import Leaderboard from '../components/features/gamification/Leaderboard';
import Feedback from '../components/common/Feedback';

const GamificationPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [latestAchievement, setLatestAchievement] = useState(null);
  const [gameData, setGameData] = useState({
    points: {
      totalPoints: 0,
      level: 1,
      nextLevelThreshold: 100,
      history: []
    },
    streak: {
      currentStreak: 0,
      bestStreak: 0
    },
    achievements: []
  });


  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    try {
      const [pointsRes, streakRes, achievementsRes] = await Promise.all([
        fetch('http://localhost:5000/gamification/points', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://localhost:5000/gamification/streak', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://localhost:5000/gamification/achievements', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (!pointsRes.ok || !streakRes.ok || !achievementsRes.ok) {
        throw new Error('Failed to fetch gamification data');
      }

      const [pointsData, streakData, achievementsData] = await Promise.all([
        pointsRes.json(),
        streakRes.json(),
        achievementsRes.json()
      ]);

      setGameData({
        points: {
          totalPoints: pointsData.totalPoints,
          level: pointsData.level,
          nextLevelThreshold: pointsData.nextLevelThreshold,
          history: pointsData.history || []
        },
        streak: {
          currentStreak: streakData.currentStreak,
          bestStreak: streakData.bestStreak
        },
        achievements: achievementsData
      });

      // Check for new achievements
      const latestAchievement = achievementsData.find(a =>
        new Date(a.unlockedAt).getTime() > new Date().getTime() - 5000
      );

      if (latestAchievement) {
        setLatestAchievement(latestAchievement);
        setShowAchievement(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/90 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <Feedback type="error" message={error} />;
  }

  return (
    <div className="min-h-screen bg-black/90">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PageHeader title="Achievements & Progress" />

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2">
            <LevelProgressBar
              currentPoints={gameData.points.totalPoints}
              nextLevelThreshold={gameData.points.nextLevelThreshold}
              level={gameData.points.level}
            />
          </div>
          <StreakCard
            currentStreak={gameData.streak.currentStreak}
            bestStreak={gameData.streak.bestStreak}
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-red-500/10 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'badges', 'leaderboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${activeTab === tab
                    ? 'border-red-500 text-orange-200'
                    : 'border-transparent text-orange-200/50 hover:text-orange-200 hover:border-red-500/50'
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-white">Recent Achievements</h3>
                    {gameData.achievements
                      .slice(-3)
                      .map((achievement, index) => (
                        <motion.div
                          key={achievement._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-black/40 p-4 rounded-lg border border-orange-500/20"
                        >
                          <h4 className="text-orange-400">{achievement.name}</h4>
                          <p className="text-gray-400 text-sm">{achievement.description}</p>
                          <p className="text-orange-200/70 text-xs mt-2">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        </motion.div>
                      ))}
                  </div>
                  <PointsHistory history={gameData.points.history} />
                </div>
              </div>
            )}
            {activeTab === 'badges' && (
              <div>
                <Badges />
              </div>
            )}
            {activeTab === 'leaderboard' && <Leaderboard />}
          </motion.div>
        </AnimatePresence>

        {/* Achievement Popup */}
        <AnimatePresence>
          {showAchievement && latestAchievement && (
            <AchievementPopup
              achievement={latestAchievement}
              onClose={() => setShowAchievement(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GamificationPage;