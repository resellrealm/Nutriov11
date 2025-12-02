import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History as HistoryIcon,
  Calendar,
  Search,
  Filter,
  Download,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader
} from 'lucide-react';
import { auth } from '../config/firebase';
import { getFoodLogByDateRange } from '../services/foodLogService';
import toast from 'react-hot-toast';
import { format, startOfDay, endOfDay, subDays, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const History = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mealHistory, setMealHistory] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date())
  });

  // Fetch meal history data from Firestore
  useEffect(() => {
    const fetchMealHistory = async () => {
      const user = auth.currentUser;
      if (!user) {
        toast.error('Please log in to view your history');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getFoodLogByDateRange(
          user.uid,
          format(dateRange.start, 'yyyy-MM-dd'),
          format(dateRange.end, 'yyyy-MM-dd')
        );

        if (result.success) {
          const groupedData = groupEntriesByDate(result.data || []);
          setMealHistory(groupedData);
          calculateWeeklySummary(result.data || []);
        } else {
          toast.error('Failed to load meal history');
          setMealHistory([]);
        }
      } catch (error) {
        console.error('Error fetching meal history:', error);
        toast.error('Failed to load meal history');
        setMealHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealHistory();
  }, [dateRange]);

  // Group entries by date
  const groupEntriesByDate = (entries) => {
    const grouped = {};
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    entries.forEach(entry => {
      const date = entry.date;
      if (!grouped[date]) {
        grouped[date] = {
          date: date === today ? 'Today' : date === yesterday ? 'Yesterday' : format(new Date(date), 'MMMM d, yyyy'),
          rawDate: date,
          meals: [],
          totals: { calories: 0, protein: 0, carbs: 0, fats: 0 }
        };
      }

      const multiplier = entry.food.servingsConsumed || 1;
      const nutrition = entry.food.nutrition || {};

      grouped[date].meals.push({
        id: entry.id,
        name: entry.food.name,
        brand: entry.food.brand,
        type: entry.mealType,
        time: format(new Date(entry.timestamp), 'h:mm a'),
        timestamp: entry.timestamp,
        calories: Math.round((nutrition.calories || 0) * multiplier),
        protein: Math.round((nutrition.protein || 0) * multiplier),
        carbs: Math.round((nutrition.carbs || 0) * multiplier),
        fats: Math.round((nutrition.fat || 0) * multiplier),
        servings: entry.food.servingsConsumed || 1,
        source: entry.food.source,
        imageUrl: entry.food.imageUrl
      });

      // Update daily totals
      grouped[date].totals.calories += (nutrition.calories || 0) * multiplier;
      grouped[date].totals.protein += (nutrition.protein || 0) * multiplier;
      grouped[date].totals.carbs += (nutrition.carbs || 0) * multiplier;
      grouped[date].totals.fats += (nutrition.fat || 0) * multiplier;
    });

    // Round totals
    Object.values(grouped).forEach(day => {
      day.totals.calories = Math.round(day.totals.calories);
      day.totals.protein = Math.round(day.totals.protein);
      day.totals.carbs = Math.round(day.totals.carbs);
      day.totals.fats = Math.round(day.totals.fats);
    });

    // Convert to array and sort by date (newest first)
    return Object.values(grouped).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
  };

  // Calculate weekly summary
  const calculateWeeklySummary = (entries) => {
    const weekAgo = subDays(new Date(), 7);
    const weekEntries = entries.filter(entry => new Date(entry.date) >= weekAgo);

    const summary = weekEntries.reduce((acc, entry) => {
      const multiplier = entry.food.servingsConsumed || 1;
      const nutrition = entry.food.nutrition || {};

      return {
        calories: acc.calories + (nutrition.calories || 0) * multiplier,
        protein: acc.protein + (nutrition.protein || 0) * multiplier,
        carbs: acc.carbs + (nutrition.carbs || 0) * multiplier,
        fats: acc.fats + (nutrition.fat || 0) * multiplier
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    setWeeklySummary({
      calories: Math.round(summary.calories),
      protein: Math.round(summary.protein),
      carbs: Math.round(summary.carbs),
      fats: Math.round(summary.fats)
    });
  };

  // Handle date navigation
  const handlePreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    setDateRange({
      start: startOfMonth(newMonth),
      end: endOfMonth(newMonth)
    });
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    setDateRange({
      start: startOfMonth(newMonth),
      end: endOfMonth(newMonth)
    });
  };

  // Export data to JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify(mealHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrio-history-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  // Filter meals based on search query
  const filteredHistory = mealHistory.map(day => ({
    ...day,
    meals: day.meals.filter(meal =>
      meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meal.brand && meal.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(day => day.meals.length > 0);

  const getMealIcon = (type) => {
    switch(type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍿';
      default: return '🍽️';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <HistoryIcon className="mr-3 text-primary" size={32} />
              Meal History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track your nutrition journey over time</p>
          </div>
          <button
            onClick={handleExportData}
            disabled={mealHistory.length === 0}
            className="mt-4 sm:mt-0 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} className="mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex space-x-2">
            <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center">
              <Calendar size={18} className="mr-2" />
              Last 30 Days
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={handleNextMonth}
            disabled={currentMonth >= new Date()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="animate-spin text-primary mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading your meal history...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredHistory.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-12 text-center"
        >
          <HistoryIcon className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {searchQuery ? 'No meals found' : 'No meal history yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Start logging your meals to see your nutrition history here'}
          </p>
        </motion.div>
      )}

      {/* Meal History List */}
      {!isLoading && filteredHistory.length > 0 && (
        <div className="space-y-6">
          {filteredHistory.map((day, dayIndex) => (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden"
            >
              {/* Day Header */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{day.date}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {day.totals.calories} cal • {day.totals.protein}g protein • {day.totals.carbs}g carbs • {day.totals.fats}g fats
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-gray-700 dark:text-gray-300">
                      {day.meals.length} {day.meals.length === 1 ? 'meal' : 'meals'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meals List */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {day.meals.map(meal => (
                  <div key={meal.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">
                          {getMealIcon(meal.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {meal.name}
                            {meal.brand && (
                              <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                                ({meal.brand})
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Clock size={14} className="mr-1" />
                            {meal.time} • {meal.type}
                            {meal.servings !== 1 && (
                              <span className="ml-2">• {meal.servings}x servings</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 dark:text-white">{meal.calories} cal</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {meal.protein}g protein • {meal.carbs}g carbs • {meal.fats}g fat
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Weekly Summary */}
      {!isLoading && mealHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <TrendingUp className="mr-2 text-primary" size={20} />
            Last 7 Days Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary dark:text-primary-light">
                {weeklySummary.calories.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Calories</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 rounded-lg">
              <p className="text-2xl font-bold text-accent dark:text-accent-light">
                {weeklySummary.protein}g
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Protein</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 rounded-lg">
              <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">
                {weeklySummary.carbs}g
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Carbs</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 dark:from-orange-500/20 dark:to-orange-500/10 rounded-lg">
              <p className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                {weeklySummary.fats}g
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Fats</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default History;
