import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import { setDiaryStyle } from '../../store/onboardingSlice';

const Step1DiaryStyle = () => {
  const dispatch = useDispatch();
  const { diaryStyle } = useSelector(state => state.onboarding);
  
  const styles = [
    {
      id: 'simple',
      icon: BookOpen,
      title: 'Simple',
      description: 'Quick logging with minimal details',
      features: [
        'Fast meal entry',
        'Basic nutritional tracking',
        'Perfect for busy lifestyles',
        'Less data entry required'
      ],
      color: 'emerald'
    },
    {
      id: 'detailed',
      icon: Sparkles,
      title: 'Detailed',
      description: 'Comprehensive tracking with insights',
      features: [
        'Advanced analytics',
        'Macro breakdowns',
        'Meal timing & portions',
        'Progress visualizations'
      ],
      color: 'teal'
    }
  ];
  
  const handleSelect = (styleId) => {
    dispatch(setDiaryStyle(styleId));
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Diary Style
        </h1>
        <p className="text-gray-600">
          Select how you want to track your meals and nutrition
        </p>
      </div>
      
      {/* Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {styles.map(({ id, icon: Icon, title, description, features, color }) => (
          <motion.button
            key={id}
            onClick={() => handleSelect(id)}
            className={`
              relative p-6 rounded-xl border-2 text-left
              transition-all duration-200
              ${diaryStyle === id
                ? `border-${color}-500 bg-${color}-50 shadow-lg scale-105`
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Select ${title} diary style`}
            aria-pressed={diaryStyle === id}
          >
            {/* Selected Badge */}
            {diaryStyle === id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute top-4 right-4 w-8 h-8 bg-${color}-500 text-white rounded-full flex items-center justify-center`}
              >
                ✓
              </motion.div>
            )}
            
            {/* Icon */}
            <div className={`w-16 h-16 rounded-full bg-${color}-100 flex items-center justify-center mb-4`}>
              <Icon className={`w-8 h-8 text-${color}-600`} />
            </div>
            
            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-4">
              {description}
            </p>
            
            {/* Features */}
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`} />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.button>
        ))}
      </div>
      
      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Don't worry, you can change this setting anytime in your account preferences!
        </p>
      </div>
    </div>
  );
};

export default Step1DiaryStyle;
