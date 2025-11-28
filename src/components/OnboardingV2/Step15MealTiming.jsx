import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Coffee, Sun, Moon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setMealTiming } from '../../store/onboardingSlice';

const Step15MealTiming = () => {
  const dispatch = useDispatch();
  const timing = useSelector(state => state.onboarding.mealTiming);
  const error = useSelector(state => state.onboarding.errors[15]);
  const [localData, setLocalData] = useState(timing);

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    dispatch(setMealTiming(newData));
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Tell us about your eating schedule</h3>
        <p className="text-gray-600">This helps us suggest meals at the right times</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Meals per day <span className="text-xs text-gray-500">(on average)</span>: {localData.mealsPerDay}
        </label>
        <input type="range" min="1" max="6" value={localData.mealsPerDay}
          onChange={(e) => handleChange('mealsPerDay', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Snacks per day <span className="text-xs text-gray-500">(on average)</span>: {localData.snacksPerDay}
        </label>
        <input type="range" min="0" max="5" value={localData.snacksPerDay}
          onChange={(e) => handleChange('snacksPerDay', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Coffee className="inline mr-1" size={14} /> Breakfast Time <span className="text-xs text-gray-500">(approx.)</span>
          </label>
          <input type="time" value={localData.breakfastTime}
            onChange={(e) => handleChange('breakfastTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Sun className="inline mr-1" size={14} /> Lunch Time <span className="text-xs text-gray-500">(approx.)</span>
          </label>
          <input type="time" value={localData.lunchTime}
            onChange={(e) => handleChange('lunchTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Moon className="inline mr-1" size={14} /> Dinner Time <span className="text-xs text-gray-500">(approx.)</span>
          </label>
          <input type="time" value={localData.dinnerTime}
            onChange={(e) => handleChange('dinnerTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Do you meal prep?</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'yes_regularly', label: 'Yes, regularly' },
            { id: 'sometimes', label: 'Sometimes' },
            { id: 'no', label: 'No' }
          ].map((option) => (
            <button key={option.id} onClick={() => handleChange('mealPreps', option.id)}
              className={`p-3 rounded-xl border-2 transition-all ${
                localData.mealPreps === option.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
              <div className="text-sm font-medium text-gray-800">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={localData.intermittentFasting}
            onChange={(e) => handleChange('intermittentFasting', e.target.checked)}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
          <span className="text-sm font-medium text-gray-700">I practice intermittent fasting</span>
        </label>
        {localData.intermittentFasting && (
          <select value={localData.fastingWindow}
            onChange={(e) => handleChange('fastingWindow', e.target.value)}
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Select fasting window</option>
            <option value="16:8">16:8 (16 hours fast, 8 hours eating)</option>
            <option value="18:6">18:6 (18 hours fast, 6 hours eating)</option>
            <option value="20:4">20:4 (20 hours fast, 4 hours eating)</option>
          </select>
        )}
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
    </motion.div>
  );
};

export default Step15MealTiming;
