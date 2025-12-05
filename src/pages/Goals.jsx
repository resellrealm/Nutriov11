import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  Target,
  TrendingUp,
  Edit3,
  X,
  Calendar,
  Clock,
  Award,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Flame,
  Activity,
  BarChart3,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserProfile } from '../services/userService';
import { getDailyTotals, getWeeklySummary } from '../services/foodLogService';
import {
  getUserGoals,
  saveUserGoals,
  calculateDefaultGoals,
  calculateGoalProgress,
  getWeeklyGoalAdherence
} from '../services/goalsService';
import { logError } from '../utils/errorLogger';

const Goals = () => {
  const userId = useSelector(state => state.auth.user?.id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User data
  const [todayData, setTodayData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);

  // Goals
  const [goals, setGoals] = useState(null);
  const [progress, setProgress] = useState(null);
  const [weeklyAdherence, setWeeklyAdherence] = useState(null);

  // UI state
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysTracked: 0,
    goalsMetToday: 0,
    totalGoals: 4,
    weeklySuccessRate: 0,
    monthlySuccessRate: 0,
    avgCaloriesPerDay: 0,
    avgProteinPerDay: 0
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const profileResult = await getUserProfile(userId);
      if (!profileResult.success) {
        throw new Error('Failed to load profile');
      }

      // Fetch or create goals
      const goalsResult = await getUserGoals(userId);
      let userGoals;

      if (goalsResult.success && goalsResult.data) {
        userGoals = goalsResult.data;
      } else {
        // Create default goals from profile
        userGoals = calculateDefaultGoals(profileResult.data);
      }
      setGoals(userGoals);

      // Fetch today's data
      const today = new Date().toISOString().split('T')[0];
      const todayResult = await getDailyTotals(userId, today);
      if (todayResult.success) {
        setTodayData(todayResult.data);

        // Calculate progress
        const todayProgress = calculateGoalProgress(todayResult.data, userGoals);
        setProgress(todayProgress);

        // Count goals met today
        let goalsMet = 0;
        if (todayProgress) {
          if (todayProgress.calories?.status === 'good') goalsMet++;
          if (todayProgress.protein?.status === 'good') goalsMet++;
          if (todayProgress.carbs?.status === 'good') goalsMet++;
          if (todayProgress.fat?.status === 'good') goalsMet++;
        }
        setStats(prev => ({ ...prev, goalsMetToday: goalsMet }));
      }

      // Fetch weekly summary
      const weeklyResult = await getWeeklySummary(userId);
      if (weeklyResult.success) {
        setWeeklyData(weeklyResult.data);

        // Calculate weekly adherence
        const adherence = getWeeklyGoalAdherence(weeklyResult.data, userGoals);
        setWeeklyAdherence(adherence);

        // Calculate stats
        const daysTracked = weeklyResult.data.totalDays || 0;

        // Calculate streak
        const sortedDates = Object.keys(weeklyResult.data.byDate || {}).sort().reverse();
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length; i++) {
          const dateObj = new Date(sortedDates[i]);
          dateObj.setHours(0, 0, 0, 0);
          const expectedDate = new Date(today);
          expectedDate.setDate(today.getDate() - i);
          expectedDate.setHours(0, 0, 0, 0);

          if (dateObj.getTime() === expectedDate.getTime()) {
            streak++;
          } else {
            break;
          }
        }

        // Calculate averages
        const dailyTotalsArray = Object.values(weeklyResult.data.dailyTotals || {});
        const avgCalories = dailyTotalsArray.length > 0
          ? Math.round(dailyTotalsArray.reduce((sum, day) => sum + (day.calories || 0), 0) / dailyTotalsArray.length)
          : 0;
        const avgProtein = dailyTotalsArray.length > 0
          ? Math.round(dailyTotalsArray.reduce((sum, day) => sum + (day.protein || 0), 0) / dailyTotalsArray.length)
          : 0;

        // Calculate success rates
        const weeklySuccess = adherence?.adherence?.allMacros?.percentage || 0;

        setStats(prevStats => ({
          currentStreak: streak,
          longestStreak: streak, // This would need historical data
          totalDaysTracked: daysTracked,
          goalsMetToday: prevStats.goalsMetToday,
          totalGoals: 4,
          weeklySuccessRate: weeklySuccess,
          monthlySuccessRate: weeklySuccess, // Would need monthly data
          avgCaloriesPerDay: avgCalories,
          avgProteinPerDay: avgProtein
        }));
      }
    } catch (error) {
      logError('Goals.fetchData', error);
      toast.error('Failed to load goals data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  const handleSaveGoals = async (newGoals) => {
    setSaving(true);
    try {
      const result = await saveUserGoals(userId, newGoals);
      if (result.success) {
        setGoals(newGoals);
        toast.success('Goals saved successfully!');
        setShowGoalModal(false);

        // Recalculate progress with new goals
        if (todayData) {
          const newProgress = calculateGoalProgress(todayData, newGoals);
          setProgress(newProgress);
        }
        if (weeklyData) {
          const newAdherence = getWeeklyGoalAdherence(weeklyData, newGoals);
          setWeeklyAdherence(newAdherence);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      logError('Goals.handleSaveGoals', error);
      toast.error('Failed to save goals');
    } finally {
      setSaving(false);
    }
  };

  // Calculate weekly chart data
  const getWeeklyProgressData = () => {
    if (!weeklyData || !weeklyData.dailyTotals || !goals) {
      return [];
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    return last7Days.map((dateStr, _index) => {
      const dayData = weeklyData.dailyTotals[dateStr];
      const dayName = days[new Date(dateStr).getDay() === 0 ? 6 : new Date(dateStr).getDay() - 1];

      if (!dayData) {
        return {
          day: dayName,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0
        };
      }

      return {
        day: dayName,
        calories: Math.round((dayData.calories / goals.calories) * 100),
        protein: Math.round((dayData.protein / goals.protein) * 100),
        carbs: Math.round((dayData.carbs / goals.carbs) * 100),
        fats: Math.round((dayData.fat / goals.fat) * 100)
      };
    });
  };

  // Get color based on progress
  const getProgressColor = (percentage) => {
    if (percentage >= 90 && percentage <= 110) return '#10b981'; // Green - perfect
    if (percentage >= 70 && percentage < 90) return '#f59e0b'; // Amber - close
    if (percentage > 110) return '#f59e0b'; // Amber - over
    return '#ef4444'; // Red - far off
  };

  const MacroCard = ({ name, progressData, size = 'large' }) => {
    if (!progressData) return null;

    const { actual, target, percentage, status } = progressData;
    const color = getProgressColor(percentage);
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    const unit = name === 'calories' ? 'kcal' : 'g';

    if (size === 'large') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">{displayName}</h3>
          <div className="w-40 h-40 mx-auto">
            <CircularProgressbar
              value={Math.min(percentage, 150)}
              text={`${percentage}%`}
              styles={buildStyles({
                textColor: color,
                pathColor: color,
                trailColor: '#e5e7eb',
                textSize: '18px',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {actual} <span className="text-sm text-gray-500">/ {target} {unit}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {status === 'good' && '✅ On target!'}
              {status === 'close' && `${target - actual} ${unit} to go`}
              {status === 'under' && `${target - actual} ${unit} to go`}
              {status === 'over' && '⚠️ Over target'}
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{displayName}</h4>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {actual} <span className="text-xs text-gray-500">/ {target} {unit}</span>
            </p>
          </div>
          <div className="w-16 h-16">
            <CircularProgressbar
              value={Math.min(percentage, 150)}
              text={`${percentage}%`}
              styles={buildStyles({
                textColor: color,
                pathColor: color,
                trailColor: '#e5e7eb',
                textSize: '24px',
              })}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const GoalSettingsModal = () => {
    const [tempGoals, setTempGoals] = useState(goals);

    useEffect(() => {
      setTempGoals(goals ? { ...goals } : null);
    }, []);

    if (!tempGoals) return null;

    return (
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Set Your Goals</h2>
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Daily Nutrition Goals</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700 dark:text-gray-300 font-medium">Calories</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempGoals.calories || ''}
                            onChange={(e) => setTempGoals({ ...tempGoals, calories: parseInt(e.target.value) || 0 })}
                            className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <span className="w-12 text-gray-500 text-sm">kcal</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-gray-700 dark:text-gray-300 font-medium">Protein</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempGoals.protein || ''}
                            onChange={(e) => setTempGoals({ ...tempGoals, protein: parseInt(e.target.value) || 0 })}
                            className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <span className="w-12 text-gray-500 text-sm">g</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-gray-700 dark:text-gray-300 font-medium">Carbs</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempGoals.carbs || ''}
                            onChange={(e) => setTempGoals({ ...tempGoals, carbs: parseInt(e.target.value) || 0 })}
                            className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <span className="w-12 text-gray-500 text-sm">g</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-gray-700 dark:text-gray-300 font-medium">Fat</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempGoals.fat || ''}
                            onChange={(e) => setTempGoals({ ...tempGoals, fat: parseInt(e.target.value) || 0 })}
                            className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <span className="w-12 text-gray-500 text-sm">g</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-gray-700 dark:text-gray-300 font-medium">Fiber</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempGoals.fiber || 25}
                            onChange={(e) => setTempGoals({ ...tempGoals, fiber: parseInt(e.target.value) || 0 })}
                            className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <span className="w-12 text-gray-500 text-sm">g</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-gray-700 dark:text-gray-300 font-medium">Water</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempGoals.water || 8}
                            onChange={(e) => setTempGoals({ ...tempGoals, water: parseInt(e.target.value) || 0 })}
                            className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <span className="w-12 text-gray-500 text-sm">glasses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-8">
                  <button
                    onClick={() => handleSaveGoals(tempGoals)}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Goals'}
                  </button>
                  <button
                    onClick={() => setShowGoalModal(false)}
                    disabled={saving}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your goals...</p>
        </div>
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load goals</p>
        </div>
      </div>
    );
  }

  const weeklyProgressData = getWeeklyProgressData();

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <Target className="mr-3 text-primary" size={32} />
              Your Goals
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track your nutrition goals and stay on target</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowGoalModal(true)}
              className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Edit3 size={18} className="mr-2" />
              Set Goals
            </button>
          </div>
        </div>
      </div>

      {/* Main Macros Grid */}
      {progress && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MacroCard name="calories" progressData={progress.calories} size="large" />
          <MacroCard name="protein" progressData={progress.protein} size="large" />
          <MacroCard name="carbs" progressData={progress.carbs} size="large" />
          <MacroCard name="fat" progressData={progress.fat} size="large" />
        </div>
      )}

      {/* Secondary Nutrients */}
      {progress && progress.fiber && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Zap className="mr-2 text-accent" size={20} />
            Other Nutrients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MacroCard name="fiber" progressData={progress.fiber} size="small" />
            {progress.water && <MacroCard name="water" progressData={progress.water} size="small" />}
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Current Streak</span>
            <Flame size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.currentStreak} days</p>
          <p className="text-xs opacity-75 mt-1">Keep it going! 🔥</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Goals Met Today</span>
            <CheckCircle size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.goalsMetToday}/{stats.totalGoals}</p>
          <p className="text-xs opacity-75 mt-1">{Math.round((stats.goalsMetToday/stats.totalGoals)*100)}% success rate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Weekly Success</span>
            <TrendingUp size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.weeklySuccessRate}%</p>
          <p className="text-xs opacity-75 mt-1">All macros on target</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Days Tracked</span>
            <Calendar size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.totalDaysTracked}</p>
          <p className="text-xs opacity-75 mt-1">This week</p>
        </motion.div>
      </div>

      {/* Weekly Progress Chart */}
      {weeklyProgressData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <BarChart3 className="mr-2 text-primary" size={20} />
            Weekly Goal Achievement (%)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 120]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="calories" fill="#10b981" name="Calories" />
              <Bar dataKey="protein" fill="#3b82f6" name="Protein" />
              <Bar dataKey="carbs" fill="#f59e0b" name="Carbs" />
              <Bar dataKey="fats" fill="#8b5cf6" name="Fats" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Info size={16} />
            <span>Target range: 90-110% of goal</span>
          </div>
        </div>
      )}

      {/* Weekly Adherence Details */}
      {weeklyAdherence && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Activity className="mr-2 text-accent" size={20} />
            Weekly Adherence
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {weeklyAdherence.adherence.calories.daysMet}/{weeklyAdherence.daysTracked}
              </p>
              <p className="text-xs text-gray-500">{weeklyAdherence.adherence.calories.percentage}% success</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {weeklyAdherence.adherence.protein.daysMet}/{weeklyAdherence.daysTracked}
              </p>
              <p className="text-xs text-gray-500">{weeklyAdherence.adherence.protein.percentage}% success</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {weeklyAdherence.adherence.carbs.daysMet}/{weeklyAdherence.daysTracked}
              </p>
              <p className="text-xs text-gray-500">{weeklyAdherence.adherence.carbs.percentage}% success</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Fats</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {weeklyAdherence.adherence.fat.daysMet}/{weeklyAdherence.daysTracked}
              </p>
              <p className="text-xs text-gray-500">{weeklyAdherence.adherence.fat.percentage}% success</p>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-xl p-6 text-center"
      >
        <p className="text-lg font-semibold text-gray-800 dark:text-white">
          {progress?.protein?.status === 'good'
            ? "🎉 Great job on your protein intake today!"
            : "💪 Keep pushing! You're doing great!"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Remember, consistency is key to achieving your nutrition goals.
        </p>
      </motion.div>

      {/* Goal Settings Modal */}
      <GoalSettingsModal />
    </div>
  );
};

export default Goals;
