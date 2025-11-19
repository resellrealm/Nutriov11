import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  TrendingUp, Activity, Flame, Target, Apple, Utensils, Calendar,
  PieChart as PieChartIcon, BarChart3, TrendingDown, Award, Clock,
  Loader, AlertCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { getUserProfile } from '../services/userService';
import { getDailyTotals, getWeeklySummary } from '../services/foodLogService';
import toast from 'react-hot-toast';

// Motivational quotes based on user goals
const getQuoteByGoal = (primaryGoal) => {
  const quotesMap = {
    'lose_weight': [
      "Every meal is a new beginning.",
      "Small changes lead to big results.",
      "Progress, not perfection.",
      "One day at a time, one meal at a time.",
    ],
    'gain_muscle': [
      "Fuel your body, energize your life.",
      "Strong body, strong mind.",
      "Consistency is the key to success.",
      "Build yourself stronger every day.",
    ],
    'maintain': [
      "Your body is a reflection of your lifestyle.",
      "Take care of your body, it's the only place you have to live.",
      "Balance is the key to wellness.",
      "Healthy habits, happy life.",
    ],
    'improve_health': [
      "Nourish your body, feed your soul.",
      "Health is wealth.",
      "You are what you eat.",
      "Eat well, live well, be well.",
    ],
    default: [
      "Every meal is a new beginning.",
      "Small changes lead to big results.",
      "Your diet is a bank account. Good food choices are good investments.",
      "Consistency is the key to success.",
    ]
  };

  const quotes = quotesMap[primaryGoal] || quotesMap.default;
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return quotes[dayOfYear % quotes.length];
};

const Dashboard = () => {
  const userId = useSelector(state => state.auth.user?.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User data
  const [userProfile, setUserProfile] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);

  // Derived data
  const [quoteOfDay, setQuoteOfDay] = useState('');
  const [weeklyCalories, setWeeklyCalories] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [mealTypeData, setMealTypeData] = useState([]);


  const fetchDashboardData = useCallback(async () => {

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    } else {
      // No user ID available, stop loading
      setLoading(false);
    }
  }, [userId]);

  const fetchDashboardData = async () => {
main
    setLoading(true);
    setError(null);

    try {
      // Fetch user profile
      const profileResult = await getUserProfile(userId);
      if (!profileResult.success) {
        throw new Error(profileResult.error || 'Failed to load profile');
      }
      const profile = profileResult.data;
      setUserProfile(profile);

      // Set personalized quote
      const goal = profile.goals?.primary || 'default';
      setQuoteOfDay(getQuoteByGoal(goal));

      // Fetch today's food log
      const today = new Date().toISOString().split('T')[0];
      const todayResult = await getDailyTotals(userId, today);
      if (todayResult.success) {
        setTodayData(todayResult.data);
      }

      // Fetch weekly summary
      const weeklyResult = await getWeeklySummary(userId);
      if (weeklyResult.success) {
        setWeeklyData(weeklyResult.data);
        processWeeklyData(weeklyResult.data, profile);
      }

    } catch (err) {
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId, fetchDashboardData]);

  const processWeeklyData = (weekly, profile) => {
    // Process weekly calories for chart
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const calorieGoal = profile.calculated?.recommendedCalories || 2000;

    // Get last 7 days dates
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const chartData = last7Days.map((dateStr, index) => {
      const dayData = weekly.dailyTotals?.[dateStr] || {};
      const dayName = days[new Date(dateStr).getDay() === 0 ? 6 : new Date(dateStr).getDay() - 1];
      return {
        day: dayName,
        calories: Math.round(dayData.calories || 0),
        goal: calorieGoal
      };
    });
    setWeeklyCalories(chartData);

    // Calculate averages from dailyTotals
    const dailyTotalsArray = Object.values(weekly.dailyTotals || {});
    const daysWithData = dailyTotalsArray.length;

    if (daysWithData > 0) {
      const totals = dailyTotalsArray.reduce((acc, day) => ({
        protein: acc.protein + (day.protein || 0),
        carbs: acc.carbs + (day.carbs || 0),
        fat: acc.fat + (day.fat || 0),
        calories: acc.calories + (day.calories || 0)
      }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

      const avgProtein = totals.protein / daysWithData;
      const avgCarbs = totals.carbs / daysWithData;
      const avgFat = totals.fat / daysWithData;
      const total = avgProtein + avgCarbs + avgFat;

      if (total > 0) {
        setMacroData([
          {
            name: 'Protein',
            value: Math.round((avgProtein / total) * 100),
            color: '#10b981'
          },
          {
            name: 'Carbs',
            value: Math.round((avgCarbs / total) * 100),
            color: '#3b82f6'
          },
          {
            name: 'Fats',
            value: Math.round((avgFat / total) * 100),
            color: '#f59e0b'
          }
        ]);
      } else {
        // Use user's macro targets if no food logged
        const macroTargets = profile.calculated?.macros || { protein: 30, carbs: 45, fat: 25 };
        setMacroData([
          { name: 'Protein', value: macroTargets.protein, color: '#10b981' },
          { name: 'Carbs', value: macroTargets.carbs, color: '#3b82f6' },
          { name: 'Fats', value: macroTargets.fat, color: '#f59e0b' }
        ]);
      }
    }

    // Process meal type distribution from byDate entries
    const mealTypeCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    Object.values(weekly.byDate || {}).forEach(entries => {
      entries.forEach(entry => {
        const mealType = entry.mealType || 'snack';
        if (mealTypeCounts[mealType] !== undefined) {
          mealTypeCounts[mealType]++;
        }
      });
    });

    const mealTypes = [
      { name: 'Breakfast', value: mealTypeCounts.breakfast },
      { name: 'Lunch', value: mealTypeCounts.lunch },
      { name: 'Dinner', value: mealTypeCounts.dinner },
      { name: 'Snacks', value: mealTypeCounts.snack }
    ];
    setMealTypeData(mealTypes.filter(m => m.value > 0));
  };

  const MEAL_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no onboarding completed
  if (!userProfile?.onboarding?.completed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <Target className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please complete the onboarding process to see your personalized dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const calorieGoal = userProfile.calculated?.recommendedCalories || 2000;
  const proteinGoal = userProfile.calculated?.macros?.protein || 120;
  const todayCalories = todayData?.totals?.calories || 0;
  const todayProtein = todayData?.totals?.protein || 0;
  const caloriePercentage = calorieGoal > 0 ? Math.round((todayCalories / calorieGoal) * 100) : 0;
  const proteinPercentage = proteinGoal > 0 ? Math.round((todayProtein / proteinGoal) * 100) : 0;

  // Get current weight
  const currentWeight = userProfile.basicInfo?.currentWeight?.value || 0;
  const weightUnit = userProfile.basicInfo?.currentWeight?.unit || 'kg';

  // Calculate streak (based on days with logged data)
  const streak = weeklyData?.totalDays || 0;

  // Calculate average daily calories
  const avgDailyCalories = weeklyData?.dailyTotals
    ? Math.round(
        Object.values(weeklyData.dailyTotals).reduce((sum, day) => sum + (day.calories || 0), 0) /
        Math.max(Object.keys(weeklyData.dailyTotals).length, 1)
      )
    : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {userProfile.basicInfo?.fullName || 'there'}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your comprehensive nutrition overview
        </p>
      </motion.div>

      {/* Quote of the Day */}
      <motion.div
        className="pulse-glow-border p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-start space-x-3">
          <div className="text-3xl">✨</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Quote of the Day
            </h3>
            <p className="text-gray-700 dark:text-gray-300 italic text-lg">
              "{quoteOfDay}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Calories Today</span>
            <Activity size={20} />
          </div>
          <p className="text-3xl font-bold">{todayCalories.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">of {calorieGoal} goal ({caloriePercentage}%)</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Current Streak</span>
            <Flame size={20} />
          </div>
          <p className="text-3xl font-bold">{streak} days</p>
          <p className="text-xs opacity-75 mt-1">{streak > 0 ? 'Keep it up! 🎉' : 'Start logging!'}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Protein</span>
            <Target size={20} />
          </div>
          <p className="text-3xl font-bold">{Math.round(todayProtein)}g</p>
          <p className="text-xs opacity-75 mt-1">of {proteinGoal}g goal ({proteinPercentage}%)</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Current Weight</span>
            <TrendingDown size={20} />
          </div>
          <p className="text-3xl font-bold">{currentWeight} {weightUnit}</p>
          <p className="text-xs opacity-75 mt-1">BMI: {userProfile.calculated?.bmi || 'N/A'}</p>
        </div>
      </motion.div>

      {/* Empty state for no food logged */}
      {todayData?.itemCount === 0 && (
        <motion.div
          className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Utensils className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Meals Logged Today
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start tracking your nutrition by logging your first meal!
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => window.location.href = '/analyze'}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition"
            >
              Analyze Meal
            </button>
            <button
              onClick={() => window.location.href = '/barcode'}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Scan Barcode
            </button>
          </div>
        </motion.div>
      )}

      {/* Charts Section */}
      {weeklyData && weeklyData.totalEntries > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Calories Chart */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-emerald-500" />
              Weekly Calorie Intake
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyCalories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#10b981" name="Actual" />
                <Bar dataKey="goal" fill="#94a3b8" name="Goal" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Macro Distribution */}
          {macroData.length > 0 && (
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
                Macronutrient Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Meal Type Distribution */}
          {mealTypeData.length > 0 && (
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Utensils className="w-5 h-5 mr-2 text-orange-500" />
                Meal Type Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={mealTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mealTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MEAL_COLORS[index % MEAL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      )}

      {/* Additional Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Meals Logged</h4>
            <Utensils className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {weeklyData?.totalEntries || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">This week</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Daily Goal</h4>
            <Target className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {calorieGoal}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Calories/day</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Avg. Daily Calories</h4>
            <Flame className="text-orange-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {avgDailyCalories}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 days</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
