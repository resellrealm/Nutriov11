import React, { useState } from 'react';
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
  MoreVertical
} from 'lucide-react';

const History = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list'); // list, calendar
  const [searchQuery, setSearchQuery] = useState('');

  const mealHistory = [
    {
      date: 'Today',
      meals: [
        { id: 1, name: 'Green Power Smoothie', type: 'breakfast', time: '8:30 AM', calories: 320, protein: 25 },
        { id: 2, name: 'Quinoa Buddha Bowl', type: 'lunch', time: '1:00 PM', calories: 380, protein: 18 },
        { id: 3, name: 'Apple with Almond Butter', type: 'snack', time: '3:30 PM', calories: 180, protein: 6 },
      ],
      totals: { calories: 880, protein: 49, carbs: 98, fats: 32 }
    },
    {
      date: 'Yesterday',
      meals: [
        { id: 4, name: 'Overnight Oats', type: 'breakfast', time: '7:45 AM', calories: 280, protein: 12 },
        { id: 5, name: 'Grilled Chicken Salad', type: 'lunch', time: '12:30 PM', calories: 420, protein: 42 },
        { id: 6, name: 'Mediterranean Salmon', type: 'dinner', time: '7:00 PM', calories: 450, protein: 38 },
      ],
      totals: { calories: 1150, protein: 92, carbs: 120, fats: 45 }
    }
  ];

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
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <HistoryIcon className="mr-3 text-indigo-500" size={32} />
              Meal History
            </h1>
            <p className="text-gray-600 mt-2">Track your nutrition journey over time</p>
          </div>
          <button className="mt-4 sm:mt-0 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center">
            <Download size={18} className="mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
              <Calendar size={18} className="mr-2" />
              Date Range
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
              <Filter size={18} className="mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-semibold text-gray-800">October 2025</h3>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Meal History List */}
      <div className="space-y-6">
        {mealHistory.map((day, dayIndex) => (
          <motion.div
            key={dayIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.1 }}
            className="bg-white rounded-xl shadow-card overflow-hidden"
          >
            {/* Day Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{day.date}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {day.totals.calories} cal • {day.totals.protein}g protein • {day.totals.carbs}g carbs • {day.totals.fats}g fats
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-white px-3 py-1 rounded-full text-gray-700">
                    {day.meals.length} meals
                  </span>
                </div>
              </div>
            </div>

            {/* Meals List */}
            <div className="divide-y divide-gray-100">
              {day.meals.map(meal => (
                <div key={meal.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                        {getMealIcon(meal.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{meal.name}</p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock size={14} className="mr-1" />
                          {meal.time} • {meal.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{meal.calories} cal</p>
                        <p className="text-sm text-gray-600">{meal.protein}g protein</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={18} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Summary */}
      <div className="mt-8 bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="mr-2 text-primary" size={20} />
          Weekly Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">13,850</p>
            <p className="text-sm text-gray-600">Total Calories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">685g</p>
            <p className="text-sm text-gray-600">Total Protein</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">1,540g</p>
            <p className="text-sm text-gray-600">Total Carbs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">462g</p>
            <p className="text-sm text-gray-600">Total Fats</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
