import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Armchair, PersonStanding, Activity, Dumbbell, Flame } from 'lucide-react';
import { setActivityLevel } from '../../store/onboardingSlice';

const Step5ActivityLevel = () => {
  const dispatch = useDispatch();
  const { activityLevel } = useSelector(state => state.onboarding);
  
  const activityLevels = [
    {
      id: 'sedentary',
      icon: Armchair,
      label: 'Sedentary',
      description: 'Little to no exercise',
      examples: 'Desk job, minimal movement',
      multiplier: '×1.2',
      color: 'gray'
    },
    {
      id: 'light',
      icon: PersonStanding,
      label: 'Lightly Active',
      description: 'Light exercise 1-3 days/week',
      examples: 'Walking, light housework',
      multiplier: '×1.375',
      color: 'blue'
    },
    {
      id: 'moderate',
      icon: Activity,
      label: 'Moderately Active',
      description: 'Moderate exercise 3-5 days/week',
      examples: 'Regular gym sessions, sports',
      multiplier: '×1.55',
      color: 'emerald',
      recommended: true
    },
    {
      id: 'active',
      icon: Dumbbell,
      label: 'Very Active',
      description: 'Hard exercise 6-7 days/week',
      examples: 'Daily intense workouts',
      multiplier: '×1.725',
      color: 'amber'
    },
    {
      id: 'very_active',
      icon: Flame,
      label: 'Extra Active',
      description: 'Very hard exercise & physical job',
      examples: 'Athlete, construction worker',
      multiplier: '×1.9',
      color: 'rose'
    }
  ];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Activity Level
        </h1>
        <p className="text-gray-600">
          This helps us calculate your daily calorie needs
        </p>
      </div>
      
      {/* Activity Level Options */}
      <div className="space-y-3">
        {activityLevels.map(({ id, icon: Icon, label, description, examples, multiplier, color, recommended }) => (
          <motion.button
            key={id}
            onClick={() => dispatch(setActivityLevel(id))}
            className={`
              w-full p-5 rounded-xl border-2 text-left transition-all duration-200
              ${activityLevel === id
                ? `border-${color}-500 bg-${color}-50 shadow-lg`
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }
            `}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            aria-label={`Activity level: ${label}`}
            aria-pressed={activityLevel === id}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`
                w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0
                ${activityLevel === id ? `bg-${color}-100` : 'bg-gray-100'}
              `}>
                <Icon className={`w-7 h-7 ${activityLevel === id ? `text-${color}-600` : 'text-gray-400'}`} />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-lg font-bold ${activityLevel === id ? `text-${color}-900` : 'text-gray-900'}`}>
                    {label}
                  </h3>
                  {recommended && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                      Most Common
                    </span>
                  )}
                  <span className={`ml-auto text-sm font-mono ${activityLevel === id ? `text-${color}-600` : 'text-gray-500'}`}>
                    {multiplier}
                  </span>
                </div>
                
                <p className={`text-sm mb-2 ${activityLevel === id ? `text-${color}-700` : 'text-gray-600'}`}>
                  {description}
                </p>
                
                <p className={`text-xs ${activityLevel === id ? `text-${color}-600` : 'text-gray-500'}`}>
                  💡 {examples}
                </p>
              </div>
              
              {/* Radio Button */}
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1
                ${activityLevel === id ? `border-${color}-500` : 'border-gray-300'}
              `}>
                {activityLevel === id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-3.5 h-3.5 rounded-full bg-${color}-500`}
                  />
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">
          🎯 How Activity Level Affects Your Plan
        </h4>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• <strong>Sedentary:</strong> Lower calorie targets, focus on nutrient density</li>
          <li>• <strong>Light to Moderate:</strong> Balanced meal plans for everyday health</li>
          <li>• <strong>Very to Extra Active:</strong> Higher calories & protein for recovery</li>
        </ul>
      </div>
      
      {/* Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>💡 Tip:</strong> Be honest! Overestimating activity level can lead to slower progress. 
          You can always adjust this later in settings.
        </p>
      </div>
    </div>
  );
};

export default Step5ActivityLevel;
