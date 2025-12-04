import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus,
  Utensils, Clock, Flame, Target, Loader, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDailyTotals } from '../services/foodLogService';

const MealCalendar = () => {
  const userId = useSelector(state => state.auth.user?.id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [mealData, setMealData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchMonthData = useCallback(async (date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth();

      // Get first and last day of month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // Calculate days to show (including prev/next month)
      const startDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();

      // Build calendar grid
      const days = [];
      const dataMap = {};

      // Previous month days
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const dateObj = new Date(year, month - 1, day);
        days.push({
          date: dateObj,
          dateStr: dateObj.toISOString().split('T')[0],
          day,
          isCurrentMonth: false,
          isToday: false
        });
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dateStr = dateObj.toISOString().split('T')[0];
        const today = new Date();
        const isToday = dateStr === today.toISOString().split('T')[0];

        days.push({
          date: dateObj,
          dateStr,
          day,
          isCurrentMonth: true,
          isToday
        });

        // Fetch data for this day if it's in the past or today
        if (dateObj <= today) {
          const result = await getDailyTotals(userId, dateStr);
          if (result.success) {
            dataMap[dateStr] = result.data;
          }
        }
      }

      // Next month days to fill grid
      const remainingDays = 42 - days.length; // 6 rows * 7 days
      for (let day = 1; day <= remainingDays; day++) {
        const dateObj = new Date(year, month + 1, day);
        days.push({
          date: dateObj,
          dateStr: dateObj.toISOString().split('T')[0],
          day,
          isCurrentMonth: false,
          isToday: false
        });
      }

      setCalendarDays(days);
      setMealData(dataMap);
    } catch (error) {
      console.error('Error fetching month data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchMonthData(currentDate);
    }
  }, [userId, currentDate, fetchMonthData]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (dayData) => {
    if (!dayData.isCurrentMonth) return;
    setSelectedDay(dayData);
  };

  const handleAddMeal = (dateStr) => {
    navigate(`/analyze?date=${dateStr}`);
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading && calendarDays.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <CalendarIcon className="mr-3 text-primary" size={32} />
              Meal Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Plan your meals and track your nutrition over time
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {monthName}
            </h2>
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition"
            >
              Today
            </button>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2 text-sm"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((dayData, index) => {
            const data = mealData[dayData.dateStr];
            const hasData = data && data.itemCount > 0;
            const calories = data?.totals?.calories || 0;

            return (
              <motion.div
                key={`${dayData.dateStr}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleDayClick(dayData)}
                className={`
                  min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all
                  ${dayData.isCurrentMonth
                    ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-50'
                  }
                  ${dayData.isToday ? 'ring-2 ring-primary' : ''}
                  ${selectedDay?.dateStr === dayData.dateStr ? 'bg-primary/10 border-primary' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`
                    text-sm font-semibold
                    ${dayData.isToday ? 'text-primary' : 'text-gray-900 dark:text-white'}
                  `}>
                    {dayData.day}
                  </span>
                  {hasData && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓
                    </span>
                  )}
                </div>

                {hasData && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <Flame className="inline mr-1" size={10} />
                      {calories} cal
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <Utensils className="inline mr-1" size={10} />
                      {data.itemCount} meals
                    </div>
                  </div>
                )}

                {dayData.isCurrentMonth && !hasData && dayData.date <= new Date() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddMeal(dayData.dateStr);
                    }}
                    className="mt-2 w-full py-1 text-xs text-primary hover:bg-primary/10 rounded transition"
                  >
                    <Plus className="inline mr-1" size={12} />
                    Add
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded border-2 border-primary mr-2"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mr-2">
                <span className="text-emerald-600 text-xs">✓</span>
              </div>
              <span>Has Meals Logged</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 mr-2"></div>
              <span>Different Month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && mealData[selectedDay.dateStr] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <button
              onClick={() => navigate(`/history?date=${selectedDay.dateStr}`)}
              className="text-sm text-primary hover:underline"
            >
              View Details →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4">
              <Flame className="text-emerald-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mealData[selectedDay.dateStr].totals.calories}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
              <Target className="text-blue-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(mealData[selectedDay.dateStr].totals.protein)}g
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4">
              <Utensils className="text-purple-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mealData[selectedDay.dateStr].itemCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Meals</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4">
              <Clock className="text-orange-600 mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(mealData[selectedDay.dateStr].totals.carbs)}g
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State for Selected Day with No Data */}
      {selectedDay && !mealData[selectedDay.dateStr] && selectedDay.date <= new Date() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-12 text-center"
        >
          <Utensils className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Meals Logged
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't logged any meals for {selectedDay.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
          <button
            onClick={() => handleAddMeal(selectedDay.dateStr)}
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            <Plus className="inline mr-2" size={20} />
            Log Meal
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MealCalendar;
