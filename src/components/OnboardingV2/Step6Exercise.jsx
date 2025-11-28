import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Timer, CalendarDays } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setExercise } from '../../store/onboardingSlice';

const Step6Exercise = () => {
  const dispatch = useDispatch();
  const exerciseData = useSelector(state => state.onboarding.exercise);
  const error = useSelector(state => state.onboarding.errors[6]);

  const [localData, setLocalData] = useState(exerciseData);

  const exerciseTypes = [
    { id: 'none', label: "I don't work out", icon: '🚫' },
    { id: 'cardio', label: 'Cardio', icon: '🏃' },
    { id: 'strength', label: 'Strength Training', icon: '💪' },
    { id: 'yoga', label: 'Yoga', icon: '🧘' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'walking', label: 'Walking', icon: '🚶' },
    { id: 'cycling', label: 'Cycling', icon: '🚴' },
    { id: 'swimming', label: 'Swimming', icon: '🏊' },
    { id: 'other', label: 'Other', icon: '🎯' }
  ];

  const toggleType = (typeId) => {
    const types = localData.types.includes(typeId)
      ? localData.types.filter(t => t !== typeId)
      : [...localData.types, typeId];

    const newData = { ...localData, types };
    setLocalData(newData);
    dispatch(setExercise(newData));
  };

  const handleDurationChange = (value) => {
    const newData = { ...localData, avgDuration: parseInt(value) || 30 };
    setLocalData(newData);
    dispatch(setExercise(newData));
  };

  const handleFrequencyChange = (value) => {
    const newData = { ...localData, frequency: parseInt(value) || 0 };
    setLocalData(newData);
    dispatch(setExercise(newData));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Tell us about your typical workout</h3>
        <p className="text-gray-600">What types of exercise do you enjoy? <span className="text-sm text-gray-500 italic">(Optional - skip if you don't work out)</span></p>
      </div>

      {/* Exercise Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Dumbbell className="inline mr-2" size={16} />
          Types of Exercise (select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {exerciseTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => toggleType(type.id)}
              className={`p-3 rounded-xl border-2 transition-all ${
                localData.types.includes(type.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-sm font-medium text-gray-800">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Average Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Timer className="inline mr-2" size={16} />
          Average Workout Duration: {localData.avgDuration} minutes
        </label>
        <input
          type="range"
          min="15"
          max="120"
          step="15"
          value={localData.avgDuration}
          onChange={(e) => handleDurationChange(e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>15 min</span>
          <span>60 min</span>
          <span>120 min</span>
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <CalendarDays className="inline mr-2" size={16} />
          Workout Frequency per Week: {localData.frequency} days
        </label>
        <div className="flex space-x-2">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((day) => (
            <button
              key={day}
              onClick={() => handleFrequencyChange(day)}
              className={`flex-1 py-3 rounded-xl border-2 transition-all font-semibold ${
                localData.frequency === day
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}
    </motion.div>
  );
};

export default Step6Exercise;
