import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Target } from 'lucide-react';
import { setWeightGoal, setPace, setTargetWeight } from '../../store/onboardingSlice';

const Step2Goals = () => {
  const dispatch = useDispatch();
  const { weightGoal, pace, targetWeight, errors } = useSelector(state => state.onboarding);
  
  const weightGoals = [
    { id: 'lose', icon: TrendingDown, label: 'Lose Weight', color: 'rose' },
    { id: 'maintain', icon: Minus, label: 'Maintain Weight', color: 'amber' },
    { id: 'gain', icon: TrendingUp, label: 'Gain Weight', color: 'emerald' }
  ];
  
  const paces = [
    { id: 'slow', label: 'Slow', subtitle: '0.25 kg/week', recommended: true },
    { id: 'moderate', label: 'Moderate', subtitle: '0.5 kg/week' },
    { id: 'fast', label: 'Fast', subtitle: '1 kg/week' }
  ];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Set Your Goals
        </h1>
        <p className="text-gray-600">
          Tell us what you want to achieve with Nutrio
        </p>
      </div>
      
      {/* Weight Goal */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          What's your weight goal?
        </label>
        <div className="grid grid-cols-3 gap-4">
          {weightGoals.map(({ id, icon: Icon, label, color }) => (
            <motion.button
              key={id}
              onClick={() => dispatch(setWeightGoal(id))}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${weightGoal === id
                  ? `border-${color}-500 bg-${color}-50`
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Goal: ${label}`}
              aria-pressed={weightGoal === id}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${weightGoal === id ? `text-${color}-600` : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${weightGoal === id ? `text-${color}-700` : 'text-gray-600'}`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Pace - Only show for lose/gain, NOT for maintain */}
      {weightGoal && weightGoal !== 'maintain' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Choose your pace
          </label>
          <div className="space-y-3">
            {paces.map(({ id, label, subtitle, recommended }) => (
              <motion.button
                key={id}
                onClick={() => dispatch(setPace(id))}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all duration-200
                  ${pace === id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                aria-label={`Pace: ${label}`}
                aria-pressed={pace === id}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{label}</span>
                      {recommended && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{subtitle}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${pace === id ? 'border-emerald-500' : 'border-gray-300'}
                  `}>
                    {pace === id && (
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Target Weight (optional for lose/gain) */}
      {weightGoal && weightGoal !== 'maintain' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label htmlFor="targetWeight" className="block text-sm font-semibold text-gray-700 mb-2">
            Target weight change (optional)
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="targetWeight"
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={targetWeight || ''}
              onChange={(e) => dispatch(setTargetWeight(parseFloat(e.target.value)))}
              placeholder="e.g., 10"
              className="w-full pl-10 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              kg
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            How much weight do you want to {weightGoal}?
          </p>
        </motion.div>
      )}
      
      {/* Error Message */}
      {errors[2] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {errors[2]}
        </motion.div>
      )}
      
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> {weightGoal === 'maintain' 
            ? 'Maintaining a healthy weight is a great goal! Focus on balanced nutrition and consistent habits.'
            : 'Slow and steady wins the race! Gradual changes are more sustainable and healthier.'}
        </p>
      </div>
    </div>
  );
};

export default Step2Goals;
