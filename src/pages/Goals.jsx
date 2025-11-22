import React, { useState } from 'react';
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
  Save,
  X,
  Plus,
  Calendar,
  Clock,
  Award,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Flame,
  TrendingDown,
  Activity,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const Goals = () => {
  const [timeInterval, setTimeInterval] = useState('daily'); // daily, weekly, custom
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Current intake (would come from backend)
  const [currentIntake] = useState({
    calories: 1650,
    protein: 78,
    carbs: 180,
    fats: 55,
    fiber: 22,
    vitaminA: 650,
    vitaminC: 75,
    vitaminD: 12,
    calcium: 800,
    iron: 14,
    water: 6
  });

  // Goal targets
  const [goals, setGoals] = useState({
    calories: { target: 2000, unit: 'kcal', enabled: true },
    protein: { target: 120, unit: 'g', enabled: true },
    carbs: { target: 250, unit: 'g', enabled: true },
    fats: { target: 70, unit: 'g', enabled: true },
    fiber: { target: 30, unit: 'g', enabled: true },
    vitaminA: { target: 900, unit: 'μg', enabled: true },
    vitaminC: { target: 90, unit: 'mg', enabled: true },
    vitaminD: { target: 20, unit: 'μg', enabled: true },
    calcium: { target: 1000, unit: 'mg', enabled: true },
    iron: { target: 18, unit: 'mg', enabled: true },
    water: { target: 8, unit: 'glasses', enabled: true }
  });

  // Calculate progress percentages
  const calculateProgress = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 150);
  };

  // Get color based on progress
  const getProgressColor = (progress) => {
    if (progress >= 90 && progress <= 110) return '#10b981'; // Green - perfect
    if (progress >= 70 && progress < 90) return '#f59e0b'; // Amber - close
    if (progress > 110) return '#f59e0b'; // Amber - over
    return '#ef4444'; // Red - far off
  };

  // Main macros for big display
  const mainMacros = ['calories', 'protein', 'carbs', 'fats'];
  
  // Secondary nutrients
  const secondaryNutrients = ['fiber', 'water'];
  
  // Vitamins and minerals
  const micronutrients = ['vitaminA', 'vitaminC', 'vitaminD', 'calcium', 'iron'];

  // Weekly progress data for charts
  const [weeklyProgress] = useState([
    { day: 'Mon', calories: 95, protein: 88, carbs: 92, fats: 98 },
    { day: 'Tue', calories: 102, protein: 95, carbs: 98, fats: 105 },
    { day: 'Wed', calories: 88, protein: 82, carbs: 85, fats: 90 },
    { day: 'Thu', calories: 98, protein: 92, carbs: 95, fats: 100 },
    { day: 'Fri', calories: 105, protein: 98, carbs: 102, fats: 95 },
    { day: 'Sat', calories: 110, protein: 105, carbs: 108, fats: 98 },
    { day: 'Sun', calories: 92, protein: 88, carbs: 90, fats: 85 }
  ]);

  // Monthly calorie trends
  const [monthlyTrends] = useState([
    { week: 'Week 1', target: 2000, actual: 1950, avgDiff: 50 },
    { week: 'Week 2', target: 2000, actual: 2100, avgDiff: -100 },
    { week: 'Week 3', target: 2000, actual: 1920, avgDiff: 80 },
    { week: 'Week 4', target: 2000, actual: 2050, avgDiff: -50 }
  ]);

  // Statistics
  const [stats] = useState({
    currentStreak: 14,
    longestStreak: 28,
    totalDaysTracked: 127,
    goalsMetToday: 3,
    totalGoals: 4,
    weeklySuccessRate: 82,
    monthlySuccessRate: 78,
    avgCaloriesPerDay: 1950,
    avgProteinPerDay: 112,
    bestDay: 'Friday',
    improvementAreas: ['Fiber', 'Vitamin D']
  });

  const handleSaveGoals = () => {
    toast.success('Goals updated successfully!');
    setShowGoalModal(false);

    // Check for achievements
    checkAchievements();
  };

  const checkAchievements = () => {
    // Check if all goals are met
    const allGoalsMet = mainMacros.every(macro => {
      const progress = calculateProgress(currentIntake[macro], goals[macro].target);
      return progress >= 90 && progress <= 110;
    });
    
    if (allGoalsMet) {
      setTimeout(() => {
        toast.success('🏆 Perfect Balance achieved! All macros on target!', {
          duration: 5000
        });
      }, 1000);
    }
  };

  const MacroCard = ({ name, current, goal, unit, size = 'large' }) => {
    const progress = calculateProgress(current, goal);
    const color = getProgressColor(progress);
    const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
    
    if (size === 'large') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">{displayName}</h3>
          <div className="w-40 h-40 mx-auto">
            <CircularProgressbar
              value={progress}
              text={`${progress}%`}
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
            <p className="text-2xl font-bold text-gray-800">
              {current} <span className="text-sm text-gray-500">/ {goal} {unit}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {progress >= 90 && progress <= 110 && '✅ On target!'}
              {progress < 90 && `${goal - current} ${unit} to go`}
              {progress > 110 && '⚠️ Over target'}
            </p>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700">{displayName}</h4>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {current} <span className="text-xs text-gray-500">/ {goal} {unit}</span>
            </p>
          </div>
          <div className="w-16 h-16">
            <CircularProgressbar
              value={progress}
              text={`${progress}%`}
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
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Set Your Goals</h2>
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Time Interval</label>
                  <div className="flex space-x-2">
                    {['daily', 'weekly', 'custom'].map((interval) => (
                      <button
                        key={interval}
                        onClick={() => setTimeInterval(interval)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                          timeInterval === interval
                            ? 'bg-gradient-to-r from-primary to-accent text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {interval.charAt(0).toUpperCase() + interval.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Main Macronutrients</h3>
                  {mainMacros.map((macro) => (
                    <div key={macro} className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={tempGoals[macro].enabled}
                        onChange={(e) => setTempGoals({
                          ...tempGoals,
                          [macro]: { ...tempGoals[macro], enabled: e.target.checked }
                        })}
                        className="w-5 h-5 text-primary rounded"
                      />
                      <label className="flex-1 text-gray-700 capitalize">{macro}</label>
                      <input
                        type="number"
                        value={tempGoals[macro].target}
                        onChange={(e) => setTempGoals({
                          ...tempGoals,
                          [macro]: { ...tempGoals[macro], target: parseInt(e.target.value) || 0 }
                        })}
                        disabled={!tempGoals[macro].enabled}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                      />
                      <span className="w-12 text-gray-500 text-sm">{tempGoals[macro].unit}</span>
                    </div>
                  ))}
                  
                  <h3 className="font-semibold text-gray-800 pt-4">Other Nutrients</h3>
                  {[...secondaryNutrients, ...micronutrients].map((nutrient) => (
                    <div key={nutrient} className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={tempGoals[nutrient].enabled}
                        onChange={(e) => setTempGoals({
                          ...tempGoals,
                          [nutrient]: { ...tempGoals[nutrient], enabled: e.target.checked }
                        })}
                        className="w-5 h-5 text-primary rounded"
                      />
                      <label className="flex-1 text-gray-700">
                        {nutrient.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <input
                        type="number"
                        value={tempGoals[nutrient].target}
                        onChange={(e) => setTempGoals({
                          ...tempGoals,
                          [nutrient]: { ...tempGoals[nutrient], target: parseInt(e.target.value) || 0 }
                        })}
                        disabled={!tempGoals[nutrient].enabled}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                      />
                      <span className="w-12 text-gray-500 text-sm">{tempGoals[nutrient].unit}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3 mt-8">
                  <button
                    onClick={() => {
                      setGoals(tempGoals);
                      handleSaveGoals();
                    }}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Save Goals
                  </button>
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Target className="mr-3 text-primary" size={32} />
              Your Goals
            </h1>
            <p className="text-gray-600 mt-2">Track your nutrition goals and stay on target</p>
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

      {/* Time Interval Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock size={20} className="text-gray-600" />
            <span className="text-gray-700 font-medium">Tracking Period:</span>
          </div>
          <div className="flex space-x-2">
            {['daily', 'weekly'].map((interval) => (
              <button
                key={interval}
                onClick={() => setTimeInterval(interval)}
                className={`px-4 py-1 rounded-lg text-sm font-medium transition-all ${
                  timeInterval === interval
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {interval.charAt(0).toUpperCase() + interval.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Macros Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainMacros.map((macro) => (
          <MacroCard
            key={macro}
            name={macro}
            current={currentIntake[macro]}
            goal={goals[macro].target}
            unit={goals[macro].unit}
            size="large"
          />
        ))}
      </div>

      {/* Secondary Nutrients */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Zap className="mr-2 text-accent" size={20} />
          Other Nutrients
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secondaryNutrients.map((nutrient) => (
            <MacroCard
              key={nutrient}
              name={nutrient}
              current={currentIntake[nutrient]}
              goal={goals[nutrient].target}
              unit={goals[nutrient].unit}
              size="small"
            />
          ))}
        </div>
      </div>

      {/* Vitamins & Minerals */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Award className="mr-2 text-orange-500" size={20} />
          Vitamins & Minerals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {micronutrients.map((nutrient) => (
            <MacroCard
              key={nutrient}
              name={nutrient}
              current={currentIntake[nutrient]}
              goal={goals[nutrient].target}
              unit={goals[nutrient].unit}
              size="small"
            />
          ))}
        </div>
      </div>

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
          <p className="text-xs opacity-75 mt-1">Longest: {stats.longestStreak} days</p>
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
          <p className="text-xs opacity-75 mt-1">Monthly: {stats.monthlySuccessRate}%</p>
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
          <p className="text-xs opacity-75 mt-1">Keep up the great work!</p>
        </motion.div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="mr-2 text-primary" size={20} />
          Weekly Goal Achievement (%)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyProgress}>
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
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
          <Info size={16} />
          <span>Target range: 90-110% of goal</span>
        </div>
      </div>

      {/* Monthly Calorie Trends */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Activity className="mr-2 text-accent" size={20} />
          Monthly Calorie Trends
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="target" stroke="#94a3b8" fill="#e2e8f0" name="Target" />
            <Area type="monotone" dataKey="actual" stroke="#10b981" fill="#10b98120" name="Actual" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg. Daily Calories</p>
            <p className="text-xl font-bold text-gray-900">{stats.avgCaloriesPerDay}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg. Daily Protein</p>
            <p className="text-xl font-bold text-gray-900">{stats.avgProteinPerDay}g</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Best Day</p>
            <p className="text-xl font-bold text-emerald-600">{stats.bestDay}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Consistency</p>
            <p className="text-xl font-bold text-blue-600">{stats.weeklySuccessRate}%</p>
          </div>
        </div>
      </div>

      {/* Improvement Areas */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <TrendingUp className="mr-2 text-amber-600" size={20} />
          Areas for Improvement
        </h3>
        <div className="space-y-2">
          {stats.improvementAreas.map((area, index) => (
            <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="text-amber-500 mr-2" size={18} />
                <span className="font-medium text-gray-800">{area}</span>
              </div>
              <span className="text-sm text-gray-600">Needs attention</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          💡 <strong>Tip:</strong> Focus on incorporating foods rich in {stats.improvementAreas[0].toLowerCase()} to meet your daily targets.
        </p>
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center"
      >
        <p className="text-lg font-semibold text-gray-800">
          {calculateProgress(currentIntake.protein, goals.protein.target) >= 90 
            ? "🎉 Great job on your protein intake today!"
            : "💪 Keep pushing! You're doing great!"}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Remember, consistency is key to achieving your nutrition goals.
        </p>
      </motion.div>

      {/* Goal Settings Modal */}
      <GoalSettingsModal />
    </div>
  );
};

export default Goals;
