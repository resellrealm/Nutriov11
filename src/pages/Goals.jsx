import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
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
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const Goals = () => {
  const [timeInterval, setTimeInterval] = useState('daily'); // daily, weekly, custom
  const [isEditMode, setIsEditMode] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Current intake (would come from backend)
  const [currentIntake, setCurrentIntake] = useState({
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

  const handleSaveGoals = () => {
    toast.success('Goals updated successfully! 🎯');
    setIsEditMode(false);
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
                          [macro]: { ...tempGoals[macro], target: parseInt(e.target.value) }
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
                          [nutrient]: { ...tempGoals[nutrient], target: parseInt(e.target.value) }
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
      <div className="bg-white rounded-2xl shadow-card p-6">
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
