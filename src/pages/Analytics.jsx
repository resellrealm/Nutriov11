import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, Calendar, Download, Filter, BarChart3,
  Activity, Target, Award, Flame, Zap, ArrowUp, ArrowDown,
  FileText, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDailyTotals, exportToCSV } from '../services/foodLogService';
import { getUserGoals } from '../services/goalsService';
import { logError } from '../utils/errorLogger';

const Analytics = () => {
  const user = useSelector(state => state.user);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, 3months
  const [analyticsData, setAnalyticsData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [goals, setGoals] = useState(null);

  const periods = [
    { id: 'week', name: 'Last 7 Days' },
    { id: 'month', name: 'Last 30 Days' },
    { id: '3months', name: 'Last 3 Months' }
  ];

  useEffect(() => {
    const calculatePercentChange = (oldVal, newVal) => {
      if (oldVal === 0) return newVal > 0 ? 100 : 0;
      return Math.round(((newVal - oldVal) / oldVal) * 100);
    };

    const calculateComparison = (currentAnalytics, previousDailyData) => {
      if (previousDailyData.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fats: 0 };
      }

      const prevTotals = previousDailyData.reduce((acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fats: acc.fats + day.fats
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

      const prevAverages = {
        calories: Math.round(prevTotals.calories / previousDailyData.length),
        protein: Math.round(prevTotals.protein / previousDailyData.length),
        carbs: Math.round(prevTotals.carbs / previousDailyData.length),
        fats: Math.round(prevTotals.fats / previousDailyData.length)
      };

      return {
        calories: calculatePercentChange(prevAverages.calories, currentAnalytics.averages.calories),
        protein: calculatePercentChange(prevAverages.protein, currentAnalytics.averages.protein),
        carbs: calculatePercentChange(prevAverages.carbs, currentAnalytics.averages.carbs),
        fats: calculatePercentChange(prevAverages.fats, currentAnalytics.averages.fats)
      };
    };

    const calculateAnalytics = (dailyData, userGoals) => {
      const daysWithData = dailyData.filter(d => d.mealsLogged > 0);
      const totalDays = dailyData.length;
      const activeDays = daysWithData.length;

      if (activeDays === 0) {
        return {
          averages: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
          totals: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, meals: 0 },
          trends: dailyData,
          macroDistribution: [],
          goalAdherence: { calories: 0, protein: 0, carbs: 0, fats: 0 },
          loggingRate: 0
        };
      }

      // Calculate averages (only from days with data)
      const totals = daysWithData.reduce((acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fats: acc.fats + day.fats,
        fiber: acc.fiber + day.fiber,
        meals: acc.meals + day.mealsLogged
      }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, meals: 0 });

      const averages = {
        calories: Math.round(totals.calories / activeDays),
        protein: Math.round(totals.protein / activeDays),
        carbs: Math.round(totals.carbs / activeDays),
        fats: Math.round(totals.fats / activeDays),
        fiber: Math.round(totals.fiber / activeDays)
      };

      // Calculate macro distribution
      const macroCalories = {
        protein: totals.protein * 4,
        carbs: totals.carbs * 4,
        fats: totals.fats * 9
      };
      const totalMacroCalories = macroCalories.protein + macroCalories.carbs + macroCalories.fats;

      const macroDistribution = totalMacroCalories > 0 ? [
        { name: 'Protein', value: Math.round((macroCalories.protein / totalMacroCalories) * 100), color: '#3b82f6' },
        { name: 'Carbs', value: Math.round((macroCalories.carbs / totalMacroCalories) * 100), color: '#10b981' },
        { name: 'Fats', value: Math.round((macroCalories.fats / totalMacroCalories) * 100), color: '#f59e0b' }
      ] : [];

      // Calculate goal adherence
      const goalAdherence = userGoals ? {
        calories: userGoals.calories > 0 ? Math.round((averages.calories / userGoals.calories) * 100) : 0,
        protein: userGoals.protein > 0 ? Math.round((averages.protein / userGoals.protein) * 100) : 0,
        carbs: userGoals.carbs > 0 ? Math.round((averages.carbs / userGoals.carbs) * 100) : 0,
        fats: userGoals.fat > 0 ? Math.round((averages.fats / userGoals.fat) * 100) : 0
      } : { calories: 0, protein: 0, carbs: 0, fats: 0 };

      return {
        averages,
        totals,
        trends: dailyData,
        macroDistribution,
        goalAdherence,
        loggingRate: Math.round((activeDays / totalDays) * 100)
      };
    };

    const loadAnalytics = async () => {
    setLoading(true);
    try {
      const userId = user.uid;

      // Get user goals
      const goalsResult = await getUserGoals(userId);
      if (goalsResult.success) {
        setGoals(goalsResult.data);
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      if (selectedPeriod === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        startDate.setDate(endDate.getDate() - 30);
      } else {
        startDate.setDate(endDate.getDate() - 90);
      }

      // Fetch daily data for the period
      const dailyData = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const result = await getDailyTotals(userId, dateStr);

        if (result.success && result.data) {
          dailyData.push({
            date: dateStr,
            displayDate: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ...result.data
          });
        } else {
          dailyData.push({
            date: dateStr,
            displayDate: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
            mealsLogged: 0
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Calculate analytics
      const analytics = calculateAnalytics(dailyData, goalsResult.data);
      setAnalyticsData(analytics);

      // Calculate comparison (previous period)
      const comparisonStartDate = new Date(startDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      comparisonStartDate.setDate(comparisonStartDate.getDate() - daysDiff);

      const comparisonDailyData = [];
      const compDate = new Date(comparisonStartDate);

      while (compDate < startDate) {
        const dateStr = compDate.toISOString().split('T')[0];
        const result = await getDailyTotals(userId, dateStr);

        if (result.success && result.data) {
          comparisonDailyData.push(result.data);
        }

        compDate.setDate(compDate.getDate() + 1);
      }

      const comparison = calculateComparison(analytics, comparisonDailyData);
      setComparisonData(comparison);

    } catch (error) {
      logError('Analytics.loadData', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
    };

    if (user?.uid) {
      loadAnalytics();
    }
  }, [user, selectedPeriod]);

  const handleExportCSV = async () => {
    try {
      const userId = user.uid;
      const endDate = new Date();
      const startDate = new Date();

      if (selectedPeriod === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        startDate.setDate(endDate.getDate() - 30);
      } else {
        startDate.setDate(endDate.getDate() - 90);
      }

      const result = await exportToCSV(userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);

      if (result.success) {
        // Create and download CSV file
        const blob = new Blob([result.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nutrio-nutrition-data-${selectedPeriod}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        toast.success('Data exported successfully!');
      } else {
        toast.error(result.error || 'Export failed');
      }
    } catch (error) {
      logError('Analytics.handleExport', error);
      toast.error('Failed to export data');
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, change, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {change !== undefined && change !== 0 && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{subtitle}</p>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <BarChart3 className="mr-3 text-primary" size={32} />
              Nutrition Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Detailed insights into your nutrition habits</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Download size={20} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-1 mb-6 inline-flex">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedPeriod === period.id
                ? 'bg-gradient-to-r from-primary to-accent text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {period.name}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      {analyticsData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Flame}
              title="Avg Daily Calories"
              value={analyticsData.averages.calories}
              subtitle={goals ? `Goal: ${goals.calories} cal` : ''}
              change={comparisonData?.calories}
              color="orange"
            />
            <StatCard
              icon={Zap}
              title="Avg Daily Protein"
              value={`${analyticsData.averages.protein}g`}
              subtitle={goals ? `Goal: ${goals.protein}g` : ''}
              change={comparisonData?.protein}
              color="blue"
            />
            <StatCard
              icon={Activity}
              title="Logging Rate"
              value={`${analyticsData.loggingRate}%`}
              subtitle={`${selectedPeriod === 'week' ? '7' : selectedPeriod === 'month' ? '30' : '90'} days tracked`}
              color="green"
            />
            <StatCard
              icon={Target}
              title="Goal Adherence"
              value={`${analyticsData.goalAdherence.calories}%`}
              subtitle="Average calorie goal"
              color="purple"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Calorie Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Calorie Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.trends}>
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="displayDate" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                  <Area type="monotone" dataKey="calories" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCalories)" />
                  {goals && (
                    <Line type="monotone" dataKey={() => goals.calories} stroke="#ef4444" strokeDasharray="5 5" dot={false} name="Goal" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Macro Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Macro Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.macroDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.macroDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-4">
                {analyticsData.macroDistribution.map((macro, idx) => (
                  <div key={macro.name} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{macro.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Macros Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Macronutrients Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="displayDate" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                  <Legend />
                  <Line type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="carbs" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fats" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Goal Adherence Over Time */}
            {goals && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Goal Adherence</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.trends.map(day => ({
                    ...day,
                    calorieAdherence: goals.calories ? Math.round((day.calories / goals.calories) * 100) : 0,
                    proteinAdherence: goals.protein ? Math.round((day.protein / goals.protein) * 100) : 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="displayDate" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
                    <Legend />
                    <Bar dataKey="calorieAdherence" fill="#f59e0b" name="Calories" />
                    <Bar dataKey="proteinAdherence" fill="#3b82f6" name="Protein" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Average Daily Macros</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-blue-800 dark:text-blue-200">
                  <span>Protein:</span>
                  <span className="font-semibold">{analyticsData.averages.protein}g</span>
                </div>
                <div className="flex justify-between text-blue-800 dark:text-blue-200">
                  <span>Carbs:</span>
                  <span className="font-semibold">{analyticsData.averages.carbs}g</span>
                </div>
                <div className="flex justify-between text-blue-800 dark:text-blue-200">
                  <span>Fats:</span>
                  <span className="font-semibold">{analyticsData.averages.fats}g</span>
                </div>
                <div className="flex justify-between text-blue-800 dark:text-blue-200">
                  <span>Fiber:</span>
                  <span className="font-semibold">{analyticsData.averages.fiber}g</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">Total Consumption</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-green-800 dark:text-green-200">
                  <span>Calories:</span>
                  <span className="font-semibold">{analyticsData.totals.calories.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-800 dark:text-green-200">
                  <span>Protein:</span>
                  <span className="font-semibold">{analyticsData.totals.protein}g</span>
                </div>
                <div className="flex justify-between text-green-800 dark:text-green-200">
                  <span>Meals Logged:</span>
                  <span className="font-semibold">{analyticsData.totals.meals}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
              <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">Period Comparison</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-purple-800 dark:text-purple-200">
                  <span>Calories:</span>
                  <div className="flex items-center space-x-1">
                    {comparisonData?.calories > 0 ? <ArrowUp size={16} className="text-green-600" /> : <ArrowDown size={16} className="text-red-600" />}
                    <span className="font-semibold">{Math.abs(comparisonData?.calories || 0)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-purple-800 dark:text-purple-200">
                  <span>Protein:</span>
                  <div className="flex items-center space-x-1">
                    {comparisonData?.protein > 0 ? <ArrowUp size={16} className="text-green-600" /> : <ArrowDown size={16} className="text-red-600" />}
                    <span className="font-semibold">{Math.abs(comparisonData?.protein || 0)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-purple-800 dark:text-purple-200">
                  <span>vs Previous Period</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {analyticsData && analyticsData.totals.meals === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start logging meals to see your nutrition analytics
          </p>
          <button className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
            Log Your First Meal
          </button>
        </div>
      )}
    </div>
  );
};

export default Analytics;
