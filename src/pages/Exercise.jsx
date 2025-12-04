import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Plus, Calendar, Flame, Clock, TrendingUp, Award,
  Loader, AlertCircle, X, Edit3, Trash2, Activity
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import { getUserProfile } from '../services/userService';
import {
  logExercise,
  getExercisesForDate,
  getWeeklySummary,
  deleteExercise,
  EXERCISE_TYPES
} from '../services/exerciseService';

const Exercise = () => {
  const userId = useSelector(state => state.auth.user?.id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayExercises, setTodayExercises] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [userWeight, setUserWeight] = useState(70);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);

  // Exercise Form
  const [exerciseForm, setExerciseForm] = useState({
    type: 'running',
    duration: '',
    intensity: 'moderate',
    notes: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user profile for weight
      const profileResult = await getUserProfile(userId);
      if (profileResult.success && profileResult.data.basicInfo?.currentWeight) {
        setUserWeight(profileResult.data.basicInfo.currentWeight.value || 70);
      }

      // Fetch today's exercises
      const todayResult = await getExercisesForDate(userId, selectedDate);
      if (todayResult.success) {
        setTodayExercises(todayResult.data.exercises);
        setTodaySummary(todayResult.data.summary);
      }

      // Fetch weekly summary
      const weeklyResult = await getWeeklySummary(userId);
      if (weeklyResult.success) {
        setWeeklySummary(weeklyResult.data);

        // Process weekly chart data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const chartData = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];

          const dayData = weeklyResult.data.dailyTotals[dateStr];
          chartData.push({
            day: dayName,
            duration: dayData?.totalDuration || 0,
            calories: dayData?.totalCalories || 0
          });
        }
        setWeeklyChartData(chartData);
      }
    } catch (error) {
      console.error('Error fetching exercise data:', error);
      toast.error('Failed to load exercise data');
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  const handleAddExercise = async () => {
    if (!exerciseForm.duration) {
      toast.error('Please enter duration');
      return;
    }

    setSaving(true);
    try {
      const result = await logExercise(
        userId,
        {
          type: exerciseForm.type,
          duration: parseInt(exerciseForm.duration),
          intensity: exerciseForm.intensity,
          notes: exerciseForm.notes,
          date: selectedDate
        },
        userWeight
      );

      if (result.success) {
        toast.success('Exercise logged successfully!');
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        toast.error('Failed to log exercise');
      }
    } catch (error) {
      toast.error('Failed to log exercise');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    try {
      const result = await deleteExercise(exerciseId);
      if (result.success) {
        toast.success('Exercise deleted');
        fetchData();
      } else {
        toast.error('Failed to delete exercise');
      }
    } catch (error) {
      toast.error('Failed to delete exercise');
    }
  };

  const resetForm = () => {
    setExerciseForm({
      type: 'running',
      duration: '',
      intensity: 'moderate',
      notes: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading exercises...</p>
        </div>
      </div>
    );
  }

  const intensityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <Dumbbell className="mr-3 text-primary" size={32} />
              Exercise Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Log and track your workouts and physical activities
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Log Exercise
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Stats Grid */}
      {weeklySummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Exercises</span>
              <Dumbbell size={20} />
            </div>
            <p className="text-3xl font-bold">{weeklySummary.totalExercises}</p>
            <p className="text-xs opacity-75 mt-1">this week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Duration</span>
              <Clock size={20} />
            </div>
            <p className="text-3xl font-bold">{weeklySummary.totalDuration}</p>
            <p className="text-xs opacity-75 mt-1">minutes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Calories Burned</span>
              <Flame size={20} />
            </div>
            <p className="text-3xl font-bold">{weeklySummary.totalCalories}</p>
            <p className="text-xs opacity-75 mt-1">kcal</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Active Days</span>
              <Award size={20} />
            </div>
            <p className="text-3xl font-bold">{weeklySummary.daysActive}</p>
            <p className="text-xs opacity-75 mt-1">out of 7 days</p>
          </motion.div>
        </div>
      )}

      {/* Today's Summary */}
      {todaySummary && todaySummary.totalExercises > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Today's Activity</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{todaySummary.totalExercises}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exercises</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{todaySummary.totalDuration} min</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{todaySummary.totalCalories} kcal</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Burned</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Exercise List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Activity className="mr-2 text-primary" size={20} />
          {selectedDate === new Date().toISOString().split('T')[0] ? "Today's Exercises" : `Exercises for ${new Date(selectedDate).toLocaleDateString()}`}
        </h3>

        {todayExercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No exercises logged for this date
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition"
            >
              Log Your First Exercise
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:shadow-md transition"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{EXERCISE_TYPES[exercise.type]?.icon || '🏃'}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {exercise.name}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="flex items-center">
                        <Clock className="mr-1" size={14} />
                        {exercise.duration} min
                      </span>
                      <span className="flex items-center">
                        <Flame className="mr-1" size={14} />
                        {exercise.caloriesBurned} kcal
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${intensityColors[exercise.intensity]}`}>
                        {exercise.intensity}
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteExercise(exercise.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Charts */}
      {weeklyChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Clock className="mr-2 text-primary" size={20} />
              Weekly Duration (minutes)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration" fill="#8b5cf6" name="Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Flame className="mr-2 text-orange-500" size={20} />
              Weekly Calories Burned
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#ef4444" strokeWidth={2} name="Calories" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Add Exercise Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Log Exercise</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Exercise Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exercise Type
                  </label>
                  <select
                    value={exerciseForm.type}
                    onChange={(e) => setExerciseForm({...exerciseForm, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.entries(EXERCISE_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.icon} {value.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={exerciseForm.duration}
                    onChange={(e) => setExerciseForm({...exerciseForm, duration: e.target.value})}
                    placeholder="30"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Intensity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Intensity
                  </label>
                  <select
                    value={exerciseForm.intensity}
                    onChange={(e) => setExerciseForm({...exerciseForm, intensity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={exerciseForm.notes}
                    onChange={(e) => setExerciseForm({...exerciseForm, notes: e.target.value})}
                    placeholder="How did it feel? Any observations?"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddExercise}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader className="animate-spin inline mr-2" size={20} />
                        Logging...
                      </>
                    ) : (
                      'Log Exercise'
                    )}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
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
    </div>
  );
};

export default Exercise;
