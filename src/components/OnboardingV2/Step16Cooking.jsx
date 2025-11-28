import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setCookingHabits } from '../../store/onboardingSlice';

const Step16Cooking = () => {
  const dispatch = useDispatch();
  const habits = useSelector(state => state.onboarding.cookingHabits);
  const error = useSelector(state => state.onboarding.errors[16]);
  const [localData, setLocalData] = useState(habits);

  const skillLevels = [
    { id: 'beginner', label: 'Beginner', emoji: '🌱' },
    { id: 'intermediate', label: 'Intermediate', emoji: '📚' },
    { id: 'advanced', label: 'Advanced', emoji: '👨‍🍳' },
    { id: 'expert', label: 'Expert Chef', emoji: '⭐' }
  ];

  const methods = [
    { id: 'stove', label: 'Stove', icon: '🔥' },
    { id: 'oven', label: 'Oven', icon: '🔥' },
    { id: 'microwave', label: 'Microwave', icon: '📻' },
    { id: 'slow_cooker', label: 'Slow Cooker', icon: '🍲' },
    { id: 'air_fryer', label: 'Air Fryer', icon: '💨' },
    { id: 'instant_pot', label: 'Instant Pot', icon: '⚡' },
    { id: 'grill', label: 'Grill', icon: '🔥' }
  ];

  const equipment = [
    'blender', 'food_processor', 'mixer', 'rice_cooker',
    'toaster', 'juicer', 'coffee_maker', 'pressure_cooker', 'none_of_above'
  ];

  const toggleMethod = (method) => {
    const updatedMethods = localData.preferredMethods.includes(method)
      ? localData.preferredMethods.filter(m => m !== method)
      : [...localData.preferredMethods, method];
    const newData = { ...localData, preferredMethods: updatedMethods };
    setLocalData(newData);
    dispatch(setCookingHabits(newData));
  };

  const toggleEquipment = (equip) => {
    let updatedEquipment;

    if (equip === 'none_of_above') {
      // If clicking "None of the above", clear all others
      updatedEquipment = localData.kitchenEquipment.includes('none_of_above')
        ? []
        : ['none_of_above'];
    } else {
      // If clicking any other equipment, remove "None of the above"
      updatedEquipment = localData.kitchenEquipment
        .filter(e => e !== 'none_of_above')
        .includes(equip)
        ? localData.kitchenEquipment.filter(e => e !== equip && e !== 'none_of_above')
        : [...localData.kitchenEquipment.filter(e => e !== 'none_of_above'), equip];
    }

    const newData = { ...localData, kitchenEquipment: updatedEquipment };
    setLocalData(newData);
    dispatch(setCookingHabits(newData));
  };

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    dispatch(setCookingHabits(newData));
  };

  const handleTimeChange = (meal, value) => {
    const newData = { ...localData, timeAvailable: { ...localData.timeAvailable, [meal]: parseInt(value) } };
    setLocalData(newData);
    dispatch(setCookingHabits(newData));
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">How do you prefer to cook?</h3>
        <p className="text-gray-600">This helps us suggest recipes that match your style</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <ChefHat className="inline mr-2" size={16} />
          Cooking Skill Level
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {skillLevels.map((level) => (
            <button key={level.id} onClick={() => handleChange('skillLevel', level.id)}
              className={`p-3 rounded-xl border-2 transition-all ${
                localData.skillLevel === level.id ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <div className="text-2xl mb-1">{level.emoji}</div>
              <div className="text-sm font-medium text-gray-800">{level.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Clock className="inline mr-2" size={16} />
          Time Available for Cooking
        </label>
        <div className="space-y-3">
          {['breakfast', 'lunch', 'dinner'].map((meal) => (
            <div key={meal}>
              <label className="text-xs text-gray-600 mb-1 block capitalize">{meal}: {localData.timeAvailable[meal]} min</label>
              <input type="range" min="5" max="120" step="5" value={localData.timeAvailable[meal]}
                onChange={(e) => handleTimeChange(meal, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Cooking Methods</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {methods.map((method) => (
            <button key={method.id} onClick={() => toggleMethod(method.id)}
              className={`p-3 rounded-xl border-2 transition-all ${
                localData.preferredMethods.includes(method.id) ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <div className="text-xl mb-1">{method.icon}</div>
              <div className="text-xs font-medium text-gray-800">{method.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Kitchen Equipment You Have</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {equipment.map((equip) => (
            <button key={equip} onClick={() => toggleEquipment(equip)}
              className={`p-2 rounded-lg border-2 transition-all text-xs ${
                localData.kitchenEquipment.includes(equip) ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
              }`}>
              {equip.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
    </motion.div>
  );
};

export default Step16Cooking;
