import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Flame, TrendingUp, Target, Calendar, Utensils, Award, CheckCircle, Zap, Heart } from 'lucide-react';

const achievementsData = [
  // Easy Achievements (15)
  { id: 1, name: 'First Steps', description: 'Log your first meal', icon: Utensils, difficulty: 'easy', unlocked: true, progress: 100 },
  { id: 2, name: 'Early Bird', description: 'Log breakfast 3 days in a row', icon: Calendar, difficulty: 'easy', unlocked: true, progress: 100 },
  { id: 3, name: 'Water Warrior', description: 'Drink 8 glasses of water in a day', icon: Heart, difficulty: 'easy', unlocked: false, progress: 62 },
  { id: 4, name: 'Veggie Lover', description: 'Log 5 meals with vegetables', icon: Utensils, difficulty: 'easy', unlocked: true, progress: 100 },
  { id: 5, name: 'Protein Power', description: 'Meet protein goal for 3 days', icon: Target, difficulty: 'easy', unlocked: false, progress: 66 },
  { id: 6, name: 'Streak Starter', description: 'Maintain a 3-day logging streak', icon: Flame, difficulty: 'easy', unlocked: true, progress: 100 },
  { id: 7, name: 'Recipe Explorer', description: 'Try 5 new recipes', icon: Star, difficulty: 'easy', unlocked: false, progress: 40 },
  { id: 8, name: 'Meal Prep Novice', description: 'Plan meals for a week', icon: Calendar, difficulty: 'easy', unlocked: false, progress: 71 },
  { id: 9, name: 'Calorie Conscious', description: 'Stay within calorie goal for 5 days', icon: Target, difficulty: 'easy', unlocked: false, progress: 80 },
  { id: 10, name: 'Balanced Breakfast', description: 'Log 10 balanced breakfasts', icon: Utensils, difficulty: 'easy', unlocked: true, progress: 100 },
  { id: 11, name: 'Snack Smart', description: 'Choose healthy snacks 7 times', icon: Star, difficulty: 'easy', unlocked: false, progress: 57 },
  { id: 12, name: 'Fiber Friend', description: 'Meet fiber goal 3 times', icon: Heart, difficulty: 'easy', unlocked: false, progress: 33 },
  { id: 13, name: 'Portion Master', description: 'Log correct portion sizes 10 times', icon: Target, difficulty: 'easy', unlocked: false, progress: 90 },
  { id: 14, name: 'Weekly Warrior', description: 'Complete a full week of logging', icon: Calendar, difficulty: 'easy', unlocked: true, progress: 100 },
  { id: 15, name: 'Macro Beginner', description: 'Track macros for 5 days', icon: TrendingUp, difficulty: 'easy', unlocked: false, progress: 60 },

  // Medium Achievements (15)
  { id: 16, name: 'Consistency King', description: 'Log meals for 30 days straight', icon: Flame, difficulty: 'medium', unlocked: false, progress: 46 },
  { id: 17, name: 'Weight Milestone', description: 'Lose/Gain 5kg towards your goal', icon: TrendingUp, difficulty: 'medium', unlocked: false, progress: 70 },
  { id: 18, name: 'Macro Master', description: 'Hit all macro goals for 7 days', icon: Target, difficulty: 'medium', unlocked: false, progress: 28 },
  { id: 19, name: 'Recipe Collector', description: 'Save 20 favorite recipes', icon: Star, difficulty: 'medium', unlocked: false, progress: 75 },
  { id: 20, name: 'Healthy Habits', description: 'Log 100 meals', icon: Utensils, difficulty: 'medium', unlocked: false, progress: 82 },
  { id: 21, name: 'Nutrition Expert', description: 'Meet all nutrient goals for 10 days', icon: Award, difficulty: 'medium', unlocked: false, progress: 40 },
  { id: 22, name: 'Meal Prep Pro', description: 'Prep meals for 4 consecutive weeks', icon: Calendar, difficulty: 'medium', unlocked: false, progress: 50 },
  { id: 23, name: 'Calorie Champion', description: 'Stay within 50 calories of goal for 14 days', icon: Target, difficulty: 'medium', unlocked: false, progress: 64 },
  { id: 24, name: 'Protein Pro', description: 'Meet protein goal for 30 days', icon: Zap, difficulty: 'medium', unlocked: false, progress: 36 },
  { id: 25, name: 'Balanced Diet', description: 'Achieve balanced macros for 21 days', icon: TrendingUp, difficulty: 'medium', unlocked: false, progress: 52 },
  { id: 26, name: 'Hydration Hero', description: 'Meet water goal for 30 days', icon: Heart, difficulty: 'medium', unlocked: false, progress: 43 },
  { id: 27, name: 'Veggie Champion', description: 'Log vegetables in 50 meals', icon: Utensils, difficulty: 'medium', unlocked: false, progress: 88 },
  { id: 28, name: 'Clean Eating', description: 'Log 30 whole food meals', icon: Star, difficulty: 'medium', unlocked: false, progress: 73 },
  { id: 29, name: 'Goal Getter', description: 'Achieve weekly goals for 6 weeks', icon: Trophy, difficulty: 'medium', unlocked: false, progress: 66 },
  { id: 30, name: 'Streak Master', description: 'Maintain a 60-day streak', icon: Flame, difficulty: 'medium', unlocked: false, progress: 31 },

  // Hard Achievements (10)
  { id: 31, name: 'Century Club', description: 'Log meals for 100 consecutive days', icon: Flame, difficulty: 'hard', unlocked: false, progress: 23 },
  { id: 32, name: 'Weight Goal Achieved', description: 'Reach your target weight', icon: Trophy, difficulty: 'hard', unlocked: false, progress: 58 },
  { id: 33, name: 'Nutrition Perfectionist', description: 'Hit all goals for 30 days straight', icon: Award, difficulty: 'hard', unlocked: false, progress: 13 },
  { id: 34, name: 'Transformation', description: 'Lose/Gain 15kg towards your goal', icon: TrendingUp, difficulty: 'hard', unlocked: false, progress: 33 },
  { id: 35, name: 'Recipe Master', description: 'Try 100 different recipes', icon: Star, difficulty: 'hard', unlocked: false, progress: 42 },
  { id: 36, name: 'Iron Will', description: 'Maintain a 180-day logging streak', icon: Flame, difficulty: 'hard', unlocked: false, progress: 15 },
  { id: 37, name: 'Macro Genius', description: 'Perfect macro balance for 60 days', icon: Target, difficulty: 'hard', unlocked: false, progress: 21 },
  { id: 38, name: 'Meal Master', description: 'Log 500 meals', icon: Utensils, difficulty: 'hard', unlocked: false, progress: 49 },
  { id: 39, name: 'Ultimate Goal', description: 'Maintain goal weight for 90 days', icon: Trophy, difficulty: 'hard', unlocked: false, progress: 7 },
  { id: 40, name: 'Legendary', description: 'Complete all other achievements', icon: Award, difficulty: 'hard', unlocked: false, progress: 47 },
];

const Achievements = () => {
  const [filter, setFilter] = useState('all');
  
  const filteredAchievements = achievementsData.filter(ach => 
    filter === 'all' ? true : ach.difficulty === filter
  );

  const stats = {
    total: achievementsData.length,
    unlocked: achievementsData.filter(a => a.unlocked).length,
    easy: achievementsData.filter(a => a.difficulty === 'easy' && a.unlocked).length,
    medium: achievementsData.filter(a => a.difficulty === 'medium' && a.unlocked).length,
    hard: achievementsData.filter(a => a.difficulty === 'hard' && a.unlocked).length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Achievements</h2>
        <p className="text-gray-600 dark:text-gray-400">Track your progress and unlock rewards</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-6 text-white">
          <Trophy className="w-8 h-8 mb-2" />
          <p className="text-3xl font-bold">{stats.unlocked}/{stats.total}</p>
          <p className="text-sm opacity-90">Achievements Unlocked</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Easy</span>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.easy}/15</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Medium</span>
            <Star className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.medium}/15</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Hard</span>
            <Award className="text-purple-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hard}/10</p>
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
        {filteredAchievements.map((achievement) => {
          const Icon = achievement.icon;
          const difficultyColors = {
            easy: 'from-green-400 to-green-500',
            medium: 'from-blue-400 to-blue-500',
            hard: 'from-purple-400 to-purple-500'
          };
          
          return (
            <motion.div
              key={achievement.id}
              className={`rounded-xl shadow-lg overflow-hidden ${
                achievement.unlocked
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-100 dark:bg-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: achievement.id * 0.01 }}
            >
              <div className={`h-2 bg-gradient-to-r ${difficultyColors[achievement.difficulty]}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl ${
                    achievement.unlocked
                      ? `bg-gradient-to-br ${difficultyColors[achievement.difficulty]}`
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}>
                    {achievement.unlocked ? (
                      <Icon className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    achievement.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    achievement.difficulty === 'medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {achievement.difficulty.toUpperCase()}
                  </span>
                </div>
                <h3 className={`font-bold text-lg mb-2 ${
                  achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-600'
                }`}>
                  {achievement.name}
                </h3>
                <p className={`text-sm mb-3 ${
                  achievement.unlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {achievement.description}
                </p>
                {!achievement.unlocked && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${difficultyColors[achievement.difficulty]} h-2 rounded-full transition-all`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {achievement.unlocked && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Unlocked!
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
