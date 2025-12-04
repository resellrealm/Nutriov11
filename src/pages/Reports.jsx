import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FileText, Download, Printer, Share2, Calendar, TrendingUp,
  Award, Target, Flame, Activity, Loader, ChevronDown
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import { getUserProfile } from '../services/userService';
import { getWeeklySummary } from '../services/foodLogService';
import { getUserGoals } from '../services/goalsService';
import { getWeeklySummary as getExerciseWeeklySummary } from '../services/exerciseService';
import { getWeeklySummary as getWaterWeeklySummary } from '../services/waterService';

const Reports = () => {
  const userId = useSelector(state => state.auth.user?.id);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Data
  const [userProfile, setUserProfile] = useState(null);
  const [foodSummary, setFoodSummary] = useState(null);
  const [exerciseSummary, setExerciseSummary] = useState(null);
  const [waterSummary, setWaterSummary] = useState(null);
  const [goals, setGoals] = useState(null);

  // Report Settings
  const [reportPeriod, setReportPeriod] = useState('week'); // week, month
  const [reportSections, setReportSections] = useState({
    overview: true,
    nutrition: true,
    exercise: true,
    water: true,
    goals: true,
    charts: true
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileResult, foodResult, exerciseResult, waterResult, goalsResult] = await Promise.all([
        getUserProfile(userId),
        getWeeklySummary(userId),
        getExerciseWeeklySummary(userId),
        getWaterWeeklySummary(userId),
        getUserGoals(userId)
      ]);

      if (profileResult.success) {
        setUserProfile(profileResult.data);
      }

      if (foodResult.success) {
        setFoodSummary(foodResult.data);
      }

      if (exerciseResult.success) {
        setExerciseSummary(exerciseResult.data);
      }

      if (waterResult.success) {
        setWaterSummary(waterResult.data);
      }

      if (goalsResult.success) {
        setGoals(goalsResult.data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setGenerating(true);
    toast.success('Generating PDF... (This is a demo)');
    // In a real app, you would use a library like jsPDF or html2pdf
    setTimeout(() => {
      toast.success('PDF generated successfully!');
      setGenerating(false);
    }, 2000);
  };

  const handleShare = async () => {
    const reportUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Nutrition Report',
          text: 'Check out my nutrition progress!',
          url: reportUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(reportUrl);
          toast.success('Link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(reportUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  // Calculate weekly chart data
  const getWeeklyNutritionData = () => {
    if (!foodSummary || !foodSummary.dailyTotals) return [];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];

      const dayData = foodSummary.dailyTotals[dateStr] || {};
      data.push({
        day: dayName,
        calories: Math.round(dayData.calories || 0),
        protein: Math.round(dayData.protein || 0),
        carbs: Math.round(dayData.carbs || 0),
        fat: Math.round(dayData.fat || 0)
      });
    }

    return data;
  };

  const getMacroDistribution = () => {
    if (!foodSummary || !foodSummary.dailyTotals) return [];

    const totals = Object.values(foodSummary.dailyTotals).reduce(
      (acc, day) => ({
        protein: acc.protein + (day.protein || 0),
        carbs: acc.carbs + (day.carbs || 0),
        fat: acc.fat + (day.fat || 0)
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );

    const total = totals.protein + totals.carbs + totals.fat;
    if (total === 0) return [];

    return [
      { name: 'Protein', value: Math.round((totals.protein / total) * 100), color: '#10b981' },
      { name: 'Carbs', value: Math.round((totals.carbs / total) * 100), color: '#3b82f6' },
      { name: 'Fats', value: Math.round((totals.fat / total) * 100), color: '#f59e0b' }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading report data...</p>
        </div>
      </div>
    );
  }

  const weeklyNutritionData = getWeeklyNutritionData();
  const macroDistribution = getMacroDistribution();

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header - Don't print */}
      <div className="mb-8 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <FileText className="mr-3 text-primary" size={32} />
              Progress Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Generate detailed reports of your nutrition and fitness journey
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handlePrint}
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center"
            >
              <Printer size={18} className="mr-2" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={generating}
              className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition flex items-center disabled:opacity-50"
            >
              <Download size={18} className="mr-2" />
              {generating ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={handleShare}
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center"
            >
              <Share2 size={18} className="mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Report Settings */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Period
              </label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Include Sections
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(reportSections).map(section => (
                  <label key={section} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={reportSections[section]}
                      onChange={() => setReportSections({
                        ...reportSections,
                        [section]: !reportSections[section]
                      })}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700 dark:text-gray-300 capitalize">{section}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content - This gets printed */}
      <div className="print:p-8 print:bg-white">
        {/* Report Header - Print Only */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nutrition & Fitness Report</h1>
          <p className="text-gray-600">
            {userProfile?.basicInfo?.fullName} • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Overview Section */}
        {reportSections.overview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6 print:shadow-none print:mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Activity className="mr-3 text-primary" size={24} />
              Overview
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 print:bg-blue-50">
                <Flame className="text-blue-600 mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white print:text-gray-900">
                  {foodSummary?.totalEntries || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Meals Logged</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 print:bg-emerald-50">
                <Target className="text-emerald-600 mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white print:text-gray-900">
                  {foodSummary?.totalDays || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Days Tracked</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 print:bg-purple-50">
                <Activity className="text-purple-600 mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white print:text-gray-900">
                  {exerciseSummary?.totalExercises || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Workouts</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl p-4 print:bg-cyan-50">
                <Award className="text-cyan-600 mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white print:text-gray-900">
                  {waterSummary?.totalGlasses || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Glasses of Water</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Nutrition Section */}
        {reportSections.nutrition && weeklyNutritionData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6 print:shadow-none print:mb-8 print:page-break-inside-avoid"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center print:text-gray-900">
              <Flame className="mr-3 text-primary" size={24} />
              Nutrition Summary
            </h2>

            {/* Averages */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white print:text-gray-900">
                  {Math.round(
                    Object.values(foodSummary.dailyTotals || {}).reduce((sum, day) => sum + (day.calories || 0), 0) /
                    Math.max(Object.keys(foodSummary.dailyTotals || {}).length, 1)
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Avg. Calories/Day</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">
                  {Math.round(
                    Object.values(foodSummary.dailyTotals || {}).reduce((sum, day) => sum + (day.protein || 0), 0) /
                    Math.max(Object.keys(foodSummary.dailyTotals || {}).length, 1)
                  )}g
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Avg. Protein/Day</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round(
                    Object.values(foodSummary.dailyTotals || {}).reduce((sum, day) => sum + (day.carbs || 0), 0) /
                    Math.max(Object.keys(foodSummary.dailyTotals || {}).length, 1)
                  )}g
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Avg. Carbs/Day</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">
                  {Math.round(
                    Object.values(foodSummary.dailyTotals || {}).reduce((sum, day) => sum + (day.fat || 0), 0) /
                    Math.max(Object.keys(foodSummary.dailyTotals || {}).length, 1)
                  )}g
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Avg. Fat/Day</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        {reportSections.charts && weeklyNutritionData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:grid-cols-2">
            {/* Weekly Calories Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 print:shadow-none print:page-break-inside-avoid"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 print:text-gray-900">
                Weekly Calorie Intake
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyNutritionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calories" fill="#10b981" name="Calories" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Macro Distribution */}
            {macroDistribution.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 print:shadow-none print:page-break-inside-avoid"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 print:text-gray-900">
                  Macronutrient Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={macroDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {macroDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
        )}

        {/* Exercise Summary */}
        {reportSections.exercise && exerciseSummary && exerciseSummary.totalExercises > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6 print:shadow-none print:mb-8 print:page-break-inside-avoid"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center print:text-gray-900">
              <Activity className="mr-3 text-primary" size={24} />
              Exercise Summary
            </h2>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-purple-600">{exerciseSummary.totalExercises}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Total Workouts</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">{exerciseSummary.totalDuration} min</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Total Duration</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{exerciseSummary.totalCalories} kcal</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Calories Burned</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Water Summary */}
        {reportSections.water && waterSummary && waterSummary.totalGlasses > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6 print:shadow-none print:mb-8 print:page-break-inside-avoid"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center print:text-gray-900">
              <Award className="mr-3 text-primary" size={24} />
              Hydration Summary
            </h2>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{waterSummary.totalGlasses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Total Glasses</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-cyan-600">{waterSummary.averagePerDay}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Avg. Per Day</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-600">{waterSummary.currentStreak}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Day Streak</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Goals Section */}
        {reportSections.goals && goals && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 print:shadow-none print:page-break-inside-avoid"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center print:text-gray-900">
              <Target className="mr-3 text-primary" size={24} />
              Goals
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600 mb-1">Calories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white print:text-gray-900">
                  {goals.calories}
                </p>
                <p className="text-xs text-gray-500">kcal/day</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600 mb-1">Protein</p>
                <p className="text-2xl font-bold text-emerald-600">{goals.protein}g</p>
                <p className="text-xs text-gray-500">per day</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600 mb-1">Carbs</p>
                <p className="text-2xl font-bold text-blue-600">{goals.carbs}g</p>
                <p className="text-xs text-gray-500">per day</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600 mb-1">Fat</p>
                <p className="text-2xl font-bold text-amber-600">{goals.fat}g</p>
                <p className="text-xs text-gray-500">per day</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer - Print Only */}
        <div className="hidden print:block mt-8 pt-8 border-t border-gray-300">
          <p className="text-sm text-gray-600 text-center">
            Generated by Nutrio • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
