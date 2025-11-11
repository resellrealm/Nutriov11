import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Activity, Flame, Target, Apple, Utensils, Calendar,
  PieChart as PieChartIcon, BarChart3, TrendingDown, Award, Clock
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Quote data
const quotes = [
  "Every meal is a new beginning.",
  "Small changes lead to big results.",
  "Your body is a reflection of your lifestyle.",
  "Progress, not perfection.",
  "Nourish your body, feed your soul.",
  "Health is wealth.",
  "You are what you eat.",
  "Start where you are, use what you have.",
  "Take care of your body, it's the only place you have to live.",
  "Eat well, live well, be well.",
  "Consistency is the key to success.",
  "Fuel your body, energize your life.",
  "Healthy habits, happy life.",
  "One day at a time, one meal at a time.",
  "Your diet is a bank account. Good food choices are good investments."
];

// Meal database with 365 meal recommendations
const mealDatabase = [
  { id: 1, name: 'Grilled Chicken Buddha Bowl', type: 'lunch', vegan: false, vegetarian: false, calories: 450, protein: 35, carbs: 45, fat: 12, cookTime: 25, instructions: 'Grill chicken, cook quinoa, roast vegetables, assemble bowl with tahini dressing.' },
  { id: 2, name: 'Vegan Chickpea Curry', type: 'dinner', vegan: true, vegetarian: true, calories: 380, protein: 18, carbs: 52, fat: 11, cookTime: 30, instructions: 'Sauté onions, add spices, chickpeas, tomatoes. Simmer 20 minutes. Serve with rice.' },
  { id: 3, name: 'Greek Yogurt Parfait', type: 'breakfast', vegan: false, vegetarian: true, calories: 320, protein: 22, carbs: 38, fat: 8, cookTime: 5, instructions: 'Layer Greek yogurt with berries, granola, and honey.' },
  { id: 4, name: 'Quinoa Stuffed Bell Peppers', type: 'dinner', vegan: false, vegetarian: true, calories: 410, protein: 16, carbs: 48, fat: 14, cookTime: 40, instructions: 'Cook quinoa, stuff peppers, bake at 375°F for 30 minutes.' },
  { id: 5, name: 'Tofu Stir Fry', type: 'lunch', vegan: true, vegetarian: true, calories: 360, protein: 20, carbs: 42, fat: 13, cookTime: 20, instructions: 'Press tofu, stir-fry with vegetables and teriyaki sauce.' },
  { id: 6, name: 'Salmon with Roasted Vegetables', type: 'dinner', vegan: false, vegetarian: false, calories: 520, protein: 38, carbs: 28, fat: 26, cookTime: 35, instructions: 'Season salmon, roast with vegetables at 400°F for 20 minutes.' },
  { id: 7, name: 'Avocado Toast with Eggs', type: 'breakfast', vegan: false, vegetarian: true, calories: 380, protein: 18, carbs: 32, fat: 20, cookTime: 10, instructions: 'Toast bread, mash avocado, top with poached eggs.' },
  { id: 8, name: 'Lentil Soup', type: 'lunch', vegan: true, vegetarian: true, calories: 290, protein: 16, carbs: 46, fat: 4, cookTime: 45, instructions: 'Simmer lentils with vegetables and herbs until tender.' },
  { id: 9, name: 'Turkey Meatballs with Zoodles', type: 'dinner', vegan: false, vegetarian: false, calories: 420, protein: 35, carbs: 22, fat: 18, cookTime: 30, instructions: 'Form meatballs, bake, serve over spiralized zucchini with marinara.' },
  { id: 10, name: 'Smoothie Bowl', type: 'breakfast', vegan: true, vegetarian: true, calories: 350, protein: 12, carbs: 58, fat: 8, cookTime: 10, instructions: 'Blend frozen fruits with plant milk, top with nuts, seeds, and fruit.' }
];

// Generate full 365 meals
const get365Meals = () => {
  const meals = [];
  for (let i = 0; i < 365; i++) {
    const baseMeal = mealDatabase[i % mealDatabase.length];
    meals.push({
      ...baseMeal,
      id: i + 1,
      dayOfYear: i + 1
    });
  }
  return meals;
};

const Dashboard = () => {
  const [quoteOfDay, setQuoteOfDay] = useState('');
  const [dailyMeal, setDailyMeal] = useState(null);
  const userProfile = useSelector(state => state.onboarding);

  // Sample nutrition data for charts
  const [weeklyCalories] = useState([
    { day: 'Mon', calories: 1850, goal: 2000 },
    { day: 'Tue', calories: 2100, goal: 2000 },
    { day: 'Wed', calories: 1920, goal: 2000 },
    { day: 'Thu', calories: 2050, goal: 2000 },
    { day: 'Fri', calories: 1780, goal: 2000 },
    { day: 'Sat', calories: 2200, goal: 2000 },
    { day: 'Sun', calories: 1950, goal: 2000 }
  ]);

  const [macroData] = useState([
    { name: 'Protein', value: 30, color: '#10b981' },
    { name: 'Carbs', value: 45, color: '#3b82f6' },
    { name: 'Fats', value: 25, color: '#f59e0b' }
  ]);

  const [nutrientData] = useState([
    { nutrient: 'Vitamin C', current: 85, target: 100 },
    { nutrient: 'Calcium', current: 75, target: 100 },
    { nutrient: 'Iron', current: 90, target: 100 },
    { nutrient: 'Fiber', current: 70, target: 100 },
    { nutrient: 'Protein', current: 95, target: 100 }
  ]);

  const [mealTypeData] = useState([
    { name: 'Breakfast', value: 25 },
    { name: 'Lunch', value: 35 },
    { name: 'Dinner', value: 30 },
    { name: 'Snacks', value: 10 }
  ]);

  const MEAL_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  useEffect(() => {
    // Get quote of the day
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setQuoteOfDay(quotes[dayOfYear % quotes.length]);

    // Get meal of the day based on day of year
    const allMeals = get365Meals();
    let recommendedMeal = allMeals[dayOfYear % 365];

    // Filter by dietary preference
    if (userProfile?.dietaryPreferences) {
      const prefs = userProfile.dietaryPreferences;
      if (prefs.includes('vegan')) {
        recommendedMeal = allMeals.find(m => m.vegan && m.dayOfYear === (dayOfYear % 365)) || 
                         allMeals.find(m => m.vegan) ||
                         recommendedMeal;
      } else if (prefs.includes('vegetarian')) {
        recommendedMeal = allMeals.find(m => m.vegetarian && m.dayOfYear === (dayOfYear % 365)) || 
                         allMeals.find(m => m.vegetarian) ||
                         recommendedMeal;
      }
    }

    setDailyMeal(recommendedMeal);
  }, [userProfile]);

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back! 👋
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
          <p className="text-3xl font-bold">1,850</p>
          <p className="text-xs opacity-75 mt-1">of 2000 goal (92%)</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Current Streak</span>
            <Flame size={20} />
          </div>
          <p className="text-3xl font-bold">14 days</p>
          <p className="text-xs opacity-75 mt-1">Personal best! 🎉</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Protein</span>
            <Target size={20} />
          </div>
          <p className="text-3xl font-bold">95g</p>
          <p className="text-xs opacity-75 mt-1">of 120g goal (79%)</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Weight Progress</span>
            <TrendingDown size={20} />
          </div>
          <p className="text-3xl font-bold">72 kg</p>
          <p className="text-xs opacity-75 mt-1">-3.5kg this month</p>
        </div>
      </motion.div>

      {/* Today's Meal Recommendation */}
      {dailyMeal && (
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  Meal of the Day #{dailyMeal.dayOfYear}
                </h3>
                <p className="text-emerald-100">
                  Specially selected for you based on your preferences
                </p>
              </div>
              <Utensils size={32} />
            </div>
          </div>

          <div className="p-6">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {dailyMeal.name}
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {dailyMeal.vegan && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  🌱 Vegan
                </span>
              )}
              {dailyMeal.vegetarian && !dailyMeal.vegan && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  🥗 Vegetarian
                </span>
              )}
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {dailyMeal.type.charAt(0).toUpperCase() + dailyMeal.type.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-center">
                <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{dailyMeal.calories}</p>
              </div>
              <div className="text-center">
                <Activity className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{dailyMeal.protein}g</p>
              </div>
              <div className="text-center">
                <Apple className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{dailyMeal.carbs}g</p>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Cook Time</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{dailyMeal.cookTime}m</p>
              </div>
            </div>

            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                How to Cook
              </h5>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {dailyMeal.instructions}
              </p>
            </div>

            <button className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-[1.02]">
              Add to My Meal Plan
            </button>
          </div>
        </motion.div>
      )}

      {/* Charts Section */}
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

        {/* Nutrient Radar Chart */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            Nutrient Achievement
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={nutrientData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="nutrient" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Current" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Radar name="Target" dataKey="target" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Meal Type Distribution */}
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
      </div>

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
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">247</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">This month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Achievements</h4>
            <Award className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">18/40</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Unlocked</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Avg. Daily Calories</h4>
            <Flame className="text-orange-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">1,950</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Last 30 days</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
