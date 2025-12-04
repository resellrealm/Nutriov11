import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Droplet, Plus, Minus, Calendar, TrendingUp, Award, Flame,
  Loader, AlertCircle, Target, Clock
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import {
  getWaterIntake,
  incrementWater,
  decrementWater,
  getWeeklySummary
} from '../services/waterService';

const Water = () => {
  const userId = useSelector(state => state.auth.user?.id);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Today's data
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayGlasses, setTodayGlasses] = useState(0);
  const [dailyGoal] = useState(8); // Default 8 glasses

  // Weekly data
  const [_weeklySummary, setWeeklySummary] = useState(null);
  const [weeklyChartData, setWeeklyChartData] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalGlasses: 0,
    averagePerDay: 0,
    daysTracked: 0
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch today's water intake
      const todayResult = await getWaterIntake(userId, todayDate);
      if (todayResult.success) {
        setTodayGlasses(todayResult.data.glasses || 0);
      }

      // Fetch weekly summary
      const weeklyResult = await getWeeklySummary(userId);
      if (weeklyResult.success) {
        setWeeklySummary(weeklyResult.data);
        setStats({
          currentStreak: weeklyResult.data.currentStreak || 0,
          totalGlasses: weeklyResult.data.totalGlasses || 0,
          averagePerDay: weeklyResult.data.averagePerDay || 0,
          daysTracked: weeklyResult.data.daysTracked || 0
        });

        // Process weekly chart data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const chartData = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];

          const dayData = weeklyResult.data.history.find(h => h.date === dateStr);
          chartData.push({
            day: dayName,
            glasses: dayData?.glasses || 0,
            goal: dailyGoal
          });
        }
        setWeeklyChartData(chartData);
      }
    } catch (error) {
      console.error('Error fetching water data:', error);
      toast.error('Failed to load water tracking data');
    } finally {
      setLoading(false);
    }
  }, [userId, todayDate, dailyGoal]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  const handleIncrement = async () => {
    if (updating) return;
    setUpdating(true);

    try {
      const result = await incrementWater(userId, todayDate);
      if (result.success) {
        setTodayGlasses(prev => prev + 1);
        if (result.data.glasses === dailyGoal) {
          toast.success('🎉 Daily goal reached! Great job!');
        } else {
          toast.success('Water logged!');
        }
        fetchData(); // Refresh weekly data
      } else {
        toast.error('Failed to log water');
      }
    } catch {
      toast.error('Failed to log water');
    } finally {
      setUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (updating || todayGlasses === 0) return;
    setUpdating(true);

    try {
      const result = await decrementWater(userId, todayDate);
      if (result.success) {
        setTodayGlasses(prev => Math.max(0, prev - 1));
        toast.success('Water removed');
        fetchData(); // Refresh weekly data
      } else {
        toast.error('Failed to remove water');
      }
    } catch {
      toast.error('Failed to remove water');
    } finally {
      setUpdating(false);
    }
  };

  const percentage = Math.round((todayGlasses / dailyGoal) * 100);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading water tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <Droplet className="mr-3 text-blue-500" size={32} />
          Water Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Stay hydrated! Track your daily water intake
        </p>
      </div>

      {/* Main Water Tracker Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl shadow-xl p-8 mb-6"
      >
        <div className="flex flex-col items-center">
          {/* Animated Water Glass Visualization */}
          <div className="relative w-48 h-64 mb-6">
            {/* Glass outline */}
            <div className="absolute inset-0 border-4 border-blue-500 rounded-b-3xl bg-transparent">
              {/* Water fill */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-b-3xl"
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {/* Water waves effect */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-blue-400/50 rounded-full blur-sm"></div>
              </motion.div>

              {/* Glass shine effect */}
              <div className="absolute inset-y-0 left-2 w-8 bg-gradient-to-r from-white/30 to-transparent"></div>
            </div>

            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.p
                  key={percentage}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold text-gray-900 dark:text-white drop-shadow-lg"
                >
                  {percentage}%
                </motion.p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {todayGlasses} / {dailyGoal} glasses
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-6 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDecrement}
              disabled={updating || todayGlasses === 0}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={28} />
            </motion.button>

            <motion.div
              key={todayGlasses}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <p className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                {todayGlasses}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">glasses</p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleIncrement}
              disabled={updating}
              className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={28} />
            </motion.button>
          </div>

          {/* Status message */}
          <div className="text-center">
            {todayGlasses >= dailyGoal ? (
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                🎉 Daily goal achieved! Excellent hydration!
              </p>
            ) : todayGlasses >= dailyGoal * 0.75 ? (
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                💧 Almost there! Keep drinking!
              </p>
            ) : todayGlasses >= dailyGoal * 0.5 ? (
              <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                🚰 Halfway there! Keep it up!
              </p>
            ) : todayGlasses > 0 ? (
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                💪 Good start! Keep going!
              </p>
            ) : (
              <p className="text-lg font-semibold text-gray-500 dark:text-gray-500">
                Start tracking your water intake today!
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Total This Week</span>
            <Droplet size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.totalGlasses}</p>
          <p className="text-xs opacity-75 mt-1">glasses</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Daily Average</span>
            <TrendingUp size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.averagePerDay}</p>
          <p className="text-xs opacity-75 mt-1">glasses/day</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Current Streak</span>
            <Flame size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.currentStreak}</p>
          <p className="text-xs opacity-75 mt-1">{stats.currentStreak === 1 ? 'day' : 'days'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Days Tracked</span>
            <Calendar size={20} />
          </div>
          <p className="text-3xl font-bold">{stats.daysTracked}</p>
          <p className="text-xs opacity-75 mt-1">this week</p>
        </motion.div>
      </div>

      {/* Weekly Chart */}
      {weeklyChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-500" size={20} />
            Weekly Water Intake
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="glasses" fill="#3b82f6" name="Glasses" />
              <Bar dataKey="goal" fill="#94a3b8" name="Goal" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Hydration Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <Award className="mr-2 text-cyan-500" size={20} />
          Hydration Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Clock className="text-blue-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Start Your Day</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drink a glass of water first thing in the morning to kickstart your metabolism
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Target className="text-emerald-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Before Meals</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drink water 30 minutes before meals to aid digestion and control appetite
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Droplet className="text-cyan-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Stay Consistent</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sip water throughout the day rather than drinking large amounts at once
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Flame className="text-orange-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">During Exercise</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Increase water intake when exercising or in hot weather
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Water;
