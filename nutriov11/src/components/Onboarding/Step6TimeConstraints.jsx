import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Clock, UtensilsCrossed, DollarSign, ChefHat } from 'lucide-react';
import { setMaxCookTime, setMealsPerDay, setBudget, setCookingSkill } from '../../store/onboardingSlice';

const Step6TimeConstraints = () => {
  const dispatch = useDispatch();
  const { maxCookTime, mealsPerDay, budget, cookingSkill, errors } = useSelector(
    (state) => state.onboarding
  );
  
  const cookTimeOptions = [
    { value: 15, label: '15 min', description: 'Quick meals' },
    { value: 30, label: '30 min', description: 'Moderate prep', recommended: true },
    { value: 45, label: '45 min', description: 'Detailed cooking' },
    { value: 60, label: '60+ min', description: 'Elaborate meals' }
  ];
  
  const budgetOptions = [
    {
      id: 'low',
      label: 'Budget-Friendly',
      description: 'Focus on affordable ingredients',
      icon: '💰',
      perMeal: '$3-5'
    },
    {
      id: 'medium',
      label: 'Moderate',
      description: 'Balance of quality and cost',
      icon: '💵',
      perMeal: '$5-10',
      recommended: true
    },
    {
      id: 'high',
      label: 'Premium',
      description: 'No budget constraints',
      icon: '💎',
      perMeal: '$10+'
    }
  ];
  
  const skillLevels = [
    {
      id: 'beginner',
      label: 'Beginner',
      description: 'Simple recipes with basic techniques',
      icon: '🌱'
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      description: 'Comfortable with common cooking methods',
      icon: '👨‍🍳',
      recommended: true
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: 'Experienced with complex techniques',
      icon: '⭐'
    }
  ];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Time & Preferences
        </h1>
        <p className="text-gray-600">
          Help us match recipes to your lifestyle
        </p>
      </div>
      
      {/* Max Cook Time */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Maximum Cook Time <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cookTimeOptions.map(({ value, label, description, recommended }) => (
            <motion.button
              key={value}
              onClick={() => dispatch(setMaxCookTime(value))}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${maxCookTime === value
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Cook time: ${label}`}
              aria-pressed={maxCookTime === value}
            >
              <Clock className={`w-6 h-6 mx-auto mb-2 ${maxCookTime === value ? 'text-emerald-600' : 'text-gray-400'}`} />
              <div className={`font-bold text-lg mb-1 ${maxCookTime === value ? 'text-emerald-700' : 'text-gray-900'}`}>
                {label}
              </div>
              <div className={`text-xs ${maxCookTime === value ? 'text-emerald-600' : 'text-gray-500'}`}>
                {description}
              </div>
              {recommended && (
                <span className="block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  Popular
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Meals Per Day */}
      <div>
        <label htmlFor="mealsPerDay" className="block text-sm font-semibold text-gray-700 mb-2">
          Meals Per Day <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <UtensilsCrossed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            id="mealsPerDay"
            value={mealsPerDay || ''}
            onChange={(e) => dispatch(setMealsPerDay(parseInt(e.target.value)))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
            required
          >
            <option value="">Select number of meals</option>
            {[2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'meal' : 'meals'} per day
                {num === 3 && ' (Recommended)'}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          💡 This includes main meals and snacks
        </p>
      </div>
      
      {/* Budget */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Budget <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {budgetOptions.map(({ id, label, description, icon, perMeal, recommended }) => (
            <motion.button
              key={id}
              onClick={() => dispatch(setBudget(id))}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all duration-200
                ${budget === id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              aria-label={`Budget: ${label}`}
              aria-pressed={budget === id}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl
                  ${budget === id ? 'bg-emerald-100' : 'bg-gray-100'}
                `}>
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${budget === id ? 'text-emerald-700' : 'text-gray-900'}`}>
                      {label}
                    </span>
                    {recommended && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        Most Popular
                      </span>
                    )}
                    <span className={`ml-auto text-sm font-medium ${budget === id ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {perMeal}/meal
                    </span>
                  </div>
                  <p className={`text-sm ${budget === id ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {description}
                  </p>
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${budget === id ? 'border-emerald-500' : 'border-gray-300'}
                `}>
                  {budget === id && (
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Cooking Skill */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Cooking Skill Level <span className="text-red-500">*</span>
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          {skillLevels.map(({ id, label, description, icon, recommended }) => (
            <motion.button
              key={id}
              onClick={() => dispatch(setCookingSkill(id))}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${cookingSkill === id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Skill level: ${label}`}
              aria-pressed={cookingSkill === id}
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className={`font-semibold mb-1 ${cookingSkill === id ? 'text-emerald-700' : 'text-gray-900'}`}>
                {label}
              </div>
              <div className={`text-xs ${cookingSkill === id ? 'text-emerald-600' : 'text-gray-600'}`}>
                {description}
              </div>
              {recommended && (
                <span className="block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  Most Selected
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Error Message */}
      {errors[6] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {errors[6]}
        </motion.div>
      )}
      
      {/* Summary */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-emerald-600" />
          Your Cooking Profile
        </h4>
        <div className="space-y-2 text-sm">
          {maxCookTime && (
            <div className="flex justify-between">
              <span className="text-gray-600">Max cook time:</span>
              <span className="font-medium text-gray-900">{maxCookTime} minutes</span>
            </div>
          )}
          {mealsPerDay && (
            <div className="flex justify-between">
              <span className="text-gray-600">Meals per day:</span>
              <span className="font-medium text-gray-900">{mealsPerDay} meals</span>
            </div>
          )}
          {budget && (
            <div className="flex justify-between">
              <span className="text-gray-600">Budget level:</span>
              <span className="font-medium text-gray-900 capitalize">{budget}</span>
            </div>
          )}
          {cookingSkill && (
            <div className="flex justify-between">
              <span className="text-gray-600">Skill level:</span>
              <span className="font-medium text-gray-900 capitalize">{cookingSkill}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Final Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>🎉 Almost done!</strong> Click "Complete" to start your personalized nutrition journey!
        </p>
      </div>
    </div>
  );
};

export default Step6TimeConstraints;
