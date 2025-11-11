import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Weight, Ruler, User, Calendar as CalendarIcon } from 'lucide-react';
import { 
  setCurrentWeight, 
  setHeight, 
  setSex, 
  setAge,
  setWeightUnit,
  setHeightUnit 
} from '../../store/onboardingSlice';

const Step3BodyMetrics = () => {
  const dispatch = useDispatch();
  const { 
    currentWeight, 
    height, 
    sex, 
    age,
    weightUnit,
    heightUnit,
    errors 
  } = useSelector(state => state.onboarding);
  
  const sexOptions = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'other', label: 'Other' }
  ];
  
  // Convert between units
  const convertWeight = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'kg' && toUnit === 'lbs') return value * 2.20462;
    if (fromUnit === 'lbs' && toUnit === 'kg') return value / 2.20462;
    return value;
  };
  
  const convertHeight = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'cm' && toUnit === 'ft') return value / 30.48;
    if (fromUnit === 'ft' && toUnit === 'cm') return value * 30.48;
    return value;
  };
  
  const handleWeightUnitChange = (newUnit) => {
    if (currentWeight) {
      const converted = convertWeight(currentWeight, weightUnit, newUnit);
      dispatch(setCurrentWeight(Math.round(converted * 10) / 10));
    }
    dispatch(setWeightUnit(newUnit));
  };
  
  const handleHeightUnitChange = (newUnit) => {
    if (height) {
      const converted = convertHeight(height, heightUnit, newUnit);
      dispatch(setHeight(Math.round(converted * 10) / 10));
    }
    dispatch(setHeightUnit(newUnit));
  };
  
  // Calculate BMI
  const calculateBMI = () => {
    if (!currentWeight || !height) return null;
    
    const weightKg = weightUnit === 'kg' ? currentWeight : currentWeight / 2.20462;
    const heightM = heightUnit === 'cm' ? height / 100 : (height * 30.48) / 100;
    
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  };
  
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'blue' };
    if (bmi < 25) return { label: 'Normal', color: 'emerald' };
    if (bmi < 30) return { label: 'Overweight', color: 'amber' };
    return { label: 'Obese', color: 'rose' };
  };
  
  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tell Us About Yourself
        </h1>
        <p className="text-gray-600">
          We'll use this to personalize your nutrition plan
        </p>
      </div>
      
      {/* Current Weight */}
      <div>
        <label htmlFor="currentWeight" className="block text-sm font-semibold text-gray-700 mb-2">
          Current Weight <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="currentWeight"
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={currentWeight || ''}
              onChange={(e) => dispatch(setCurrentWeight(parseFloat(e.target.value)))}
              placeholder={weightUnit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => handleWeightUnitChange('kg')}
              className={`px-4 py-3 transition-colors ${
                weightUnit === 'kg' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              kg
            </button>
            <button
              onClick={() => handleWeightUnitChange('lbs')}
              className={`px-4 py-3 transition-colors border-l ${
                weightUnit === 'lbs' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              lbs
            </button>
          </div>
        </div>
      </div>
      
      {/* Height */}
      <div>
        <label htmlFor="height" className="block text-sm font-semibold text-gray-700 mb-2">
          Height <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="height"
              type="number"
              step="0.1"
              min={heightUnit === 'cm' ? 100 : 3}
              max={heightUnit === 'cm' ? 250 : 8}
              value={height || ''}
              onChange={(e) => dispatch(setHeight(parseFloat(e.target.value)))}
              placeholder={heightUnit === 'cm' ? 'e.g., 170' : 'e.g., 5.7'}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => handleHeightUnitChange('cm')}
              className={`px-4 py-3 transition-colors ${
                heightUnit === 'cm' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              cm
            </button>
            <button
              onClick={() => handleHeightUnitChange('ft')}
              className={`px-4 py-3 transition-colors border-l ${
                heightUnit === 'ft' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ft
            </button>
          </div>
        </div>
      </div>
      
      {/* BMI Display */}
      {bmi && bmiCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 bg-${bmiCategory.color}-50 border border-${bmiCategory.color}-200 rounded-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your BMI</p>
              <p className="text-2xl font-bold text-gray-900">{bmi}</p>
            </div>
            <span className={`px-3 py-1 bg-${bmiCategory.color}-100 text-${bmiCategory.color}-700 rounded-full text-sm font-medium`}>
              {bmiCategory.label}
            </span>
          </div>
        </motion.div>
      )}
      
      {/* Sex */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Sex <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {sexOptions.map(({ id, label }) => (
            <motion.button
              key={id}
              onClick={() => dispatch(setSex(id))}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${sex === id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Sex: ${label}`}
              aria-pressed={sex === id}
            >
              <User className={`w-6 h-6 mx-auto mb-2 ${sex === id ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${sex === id ? 'text-emerald-700' : 'text-gray-600'}`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Age */}
      <div>
        <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
          Age <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="age"
            type="number"
            min="13"
            max="120"
            value={age || ''}
            onChange={(e) => dispatch(setAge(parseInt(e.target.value)))}
            placeholder="e.g., 25"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>
        {age && age < 13 && (
          <p className="mt-1 text-sm text-red-600">You must be at least 13 years old to use Nutrio</p>
        )}
      </div>
      
      {/* Error Message */}
      {errors[3] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {errors[3]}
        </motion.div>
      )}
      
      {/* Privacy Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          🔒 <strong>Privacy:</strong> Your data is encrypted and never shared with third parties.
        </p>
      </div>
    </div>
  );
};

export default Step3BodyMetrics;
