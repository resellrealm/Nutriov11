import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Flame, TrendingUp, Target, Calendar, Utensils, Award, CheckCircle, Zap, Heart, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { getWeeklySummary } from '../services/foodLogService';
import { getUserGoals } from '../services/goalsService';
import {
  getUserAchievements,
  calculateAchievementStats,
  checkAndUpdateAchievements,
  getAchievementCounts,
  ACHIEVEMENT_DEFINITIONS
} from '../services/achievementsService';

// Icon mapping
const iconMap = {
  Utensils, Calendar, Heart, Target, Flame, Star, Zap, TrendingUp, Award, Trophy
};

const Achievements = () => {
  const userId = useSelector(state => state.auth.user?.id);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [achievements, setAchievements] = useState({ unlocked: [], progress: {} });
  const [stats, setStats] = useState({});
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch weekly data (includes all food log data)
      const weeklyResult = await getWeeklySummary(userId);
      if (!weeklyResult.success) {
        throw new Error('Failed to load food log data');
      }

      // Fetch goals
      const goalsResult = await getUserGoals(userId);
      const goals = goalsResult.success && goalsResult.data ? goalsResult.data : null;

      // Calculate achievement stats from food log
      const calculatedStats = calculateAchievementStats(weeklyResult.data, goals);
      setStats(calculatedStats);

      // Check and update achievements
      const achievementsResult = await checkAndUpdateAchievements(userId, calculatedStats);
      if (achievementsResult.success) {
        setAchievements({
          unlocked: achievementsResult.data.unlocked,
          progress: achievementsResult.data.progress
        });

        // Show toast for newly unlocked achievements
        if (achievementsResult.data.newlyUnlocked && achievementsResult.data.newlyUnlocked.length > 0) {
          achievementsResult.data.newlyUnlocked.forEach(achievement => {
            toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
              duration: 5000,
              icon: '🎉'
            });
          });
          setNewlyUnlocked(achievementsResult.data.newlyUnlocked.map(a => a.id));
        }
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAchievements();
    }
  }, [userId, fetchAchievements]);

  const filteredAchievements = ACHIEVEMENT_DEFINITIONS.filter(ach =>
    filter === 'all' ? true : ach.difficulty === filter
  );

  const counts = getAchievementCounts(achievements.unlocked);

  const AchievementCard = ({ achievement }) => {
    const isUnlocked = achievements.unlocked.includes(achievement.id);
    const isNewlyUnlocked = newlyUnlocked.includes(achievement.id);
    const progress = achievements.progress[achievement.id] || 0;

    // Default icon
    let IconComponent = Trophy;

    // Try to determine icon from achievement name
    if (achievement.name.toLowerCase().includes('meal') || achievement.name.toLowerCase().includes('breakfast')) {
      IconComponent = Utensils;
    } else if (achievement.name.toLowerCase().includes('water') || achievement.name.toLowerCase().includes('hydration')) {
      IconComponent = Heart;
    } else if (achievement.name.toLowerCase().includes('streak') || achievement.name.toLowerCase().includes('day')) {
      IconComponent = Flame;
    } else if (achievement.name.toLowerCase().includes('protein') || achievement.name.toLowerCase().includes('macro')) {
      IconComponent = Target;
    } else if (achievement.name.toLowerCase().includes('week') || achievement.name.toLowerCase().includes('calendar')) {
      IconComponent = Calendar;
    } else if (achievement.name.toLowerCase().includes('star') || achievement.name.toLowerCase().includes('recipe')) {
      IconComponent = Star;
    } else if (achievement.name.toLowerCase().includes('goal')) {
      IconComponent = Award;
    }

    const difficultyColors = {
      easy: 'from-green-400 to-green-500',
      medium: 'from-blue-400 to-blue-500',
      hard: 'from-purple-400 to-purple-500'
    };

    return (
      <motion.div
        key={achievement.id}
        className={`rounded-xl shadow-lg overflow-hidden ${
          isUnlocked
            ? 'bg-white dark:bg-gray-800'
            : 'bg-gray-100 dark:bg-gray-900'
        } ${isNewlyUnlocked ? 'ring-4 ring-yellow-400' : ''}`}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(achievement.id * 0.01, 0.5) }}
      >
        <div className={`h-2 bg-gradient-to-r ${difficultyColors[achievement.difficulty]}`} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-3 rounded-xl ${
              isUnlocked
                ? `bg-gradient-to-br ${difficultyColors[achievement.difficulty]}`
                : 'bg-gray-300 dark:bg-gray-700'
            }`}>
              {isUnlocked ? (
                <IconComponent className="w-6 h-6 text-white" />
              ) : (
                <Lock className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              achievement.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              achievement.difficulty === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
              'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
            }`}>
              {achievement.difficulty.toUpperCase()}
            </span>
          </div>
          <h3 className={`font-bold text-lg mb-2 ${
            isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-600'
          }`}>
            {achievement.name}
          </h3>
          <p className={`text-sm mb-3 ${
            isUnlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'
          }`}>
            {achievement.description}
          </p>
          {!isUnlocked && (
            <div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${difficultyColors[achievement.difficulty]} h-2 rounded-full transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {isUnlocked && (
            <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
              <CheckCircle className="w-4 h-4 mr-1" />
              Unlocked!
            </div>
          )}
          {isNewlyUnlocked && (
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
              ✨ NEW!
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Achievements</h2>
        <p className="text-gray-600 dark:text-gray-400">Track your progress and unlock rewards</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-6 text-white">
          <Trophy className="w-8 h-8 mb-2" />
          <p className="text-3xl font-bold">{counts.unlocked}/{counts.total}</p>
          <p className="text-sm opacity-90">Achievements Unlocked</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Easy</span>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts.easy}/10</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Medium</span>
            <Star className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts.medium}/8</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Hard</span>
            <Award className="text-purple-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts.hard}/6</p>
        </div>
      </div>

      {/* Stats Display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Meals</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMealsLogged || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
            <p className="text-2xl font-bold text-orange-500">{stats.currentStreak || 0} days</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Days Tracked</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.daysTracked || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Goals Met</p>
            <p className="text-2xl font-bold text-green-500">{stats.daysMetAllMacros || 0} days</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'easy', 'medium', 'hard'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-emerald-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};

export default Achievements;
