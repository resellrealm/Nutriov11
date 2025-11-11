import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, X, Utensils, AlertCircle, Search } from 'lucide-react';
import {
  addCuisine,
  removeCuisine,
  addFavoriteFood,
  removeFavoriteFood,
  addAllergy,
  removeAllergy,
  setDietPattern
} from '../../store/onboardingSlice';

const Step4DietaryPrefs = () => {
  const dispatch = useDispatch();
  const { cuisines, favoriteFoods, allergies, dietPattern, errors } = useSelector(
    (state) => state.onboarding
  );

  const [favoriteInput, setFavoriteInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  const availableCuisines = [
    { id: 'italian', label: 'Italian', emoji: '🍝' },
    { id: 'asian', label: 'Asian', emoji: '🍜' },
    { id: 'mexican', label: 'Mexican', emoji: '🌮' },
    { id: 'mediterranean', label: 'Mediterranean', emoji: '🥗' },
    { id: 'american', label: 'American', emoji: '🍔' },
    { id: 'indian', label: 'Indian', emoji: '🍛' },
    { id: 'japanese', label: 'Japanese', emoji: '🍱' },
    { id: 'chinese', label: 'Chinese', emoji: '🥟' },
    { id: 'thai', label: 'Thai', emoji: '🍲' },
    { id: 'french', label: 'French', emoji: '🥐' },
    { id: 'greek', label: 'Greek', emoji: '🥙' },
    { id: 'middle_eastern', label: 'Middle Eastern', emoji: '🧆' }
  ];

  const dietPatterns = [
    { id: 'omnivore', label: 'Omnivore', description: 'I eat everything', emoji: '🍽️' },
    { id: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish', emoji: '🥕' },
    { id: 'vegan', label: 'Vegan', description: 'No animal products', emoji: '🌱' },
    { id: 'pescatarian', label: 'Pescatarian', description: 'Fish but no meat', emoji: '🐟' },
    { id: 'keto', label: 'Keto', description: 'Low carb, high fat', emoji: '🥓' },
    { id: 'paleo', label: 'Paleo', description: 'Whole foods only', emoji: '🥩' }
  ];

  const commonAllergies = [
    'Nuts', 'Peanuts', 'Dairy', 'Gluten', 'Eggs', 'Soy',
    'Fish', 'Shellfish', 'Wheat', 'Sesame', 'Corn', 'Tomatoes'
  ];

  const handleAddFavorite = () => {
    if (favoriteInput.trim()) {
      dispatch(addFavoriteFood(favoriteInput.trim()));
      setFavoriteInput('');
    }
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      dispatch(addAllergy(allergyInput.trim()));
      setAllergyInput('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dietary Preferences
        </h1>
        <p className="text-gray-600">
          Help us personalize your meal recommendations
        </p>
      </div>

      {/* Cuisines */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Favorite Cuisines <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">Select at least one</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {availableCuisines.map(({ id, label, emoji }) => (
            <motion.button
              key={id}
              onClick={() => {
                if (cuisines.includes(id)) {
                  dispatch(removeCuisine(id));
                } else {
                  dispatch(addCuisine(id));
                }
              }}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200
                ${cuisines.includes(id)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Cuisine: ${label}`}
              aria-pressed={cuisines.includes(id)}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <div className={`text-sm font-medium ${cuisines.includes(id) ? 'text-emerald-700' : 'text-gray-600'}`}>
                {label}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Favorite Foods */}
      <div>
        <label htmlFor="favoriteFood" className="block text-sm font-semibold text-gray-700 mb-2">
          Favorite Foods (Optional)
        </label>
        <p className="text-sm text-gray-600 mb-3">
          We'll recommend meals with these ingredients
        </p>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="favoriteFood"
              type="text"
              value={favoriteInput}
              onChange={(e) => setFavoriteInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFavorite()}
              placeholder="e.g., Chicken, Avocado, Pasta"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAddFavorite}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {favoriteFoods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {favoriteFoods.map((food, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm"
              >
                {food}
                <button
                  onClick={() => dispatch(removeFavoriteFood(food))}
                  className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${food}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Allergies & Restrictions */}
      <div>
        <label htmlFor="allergy" className="block text-sm font-semibold text-gray-700 mb-2">
          Allergies & Restrictions
        </label>
        <p className="text-sm text-gray-600 mb-3">
          We'll exclude these from your meal plans
        </p>
        
        {/* Common allergies quick select */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Quick select:</p>
          <div className="flex flex-wrap gap-2">
            {commonAllergies.map((allergy) => (
              <button
                key={allergy}
                onClick={() => {
                  if (allergies.includes(allergy)) {
                    dispatch(removeAllergy(allergy));
                  } else {
                    dispatch(addAllergy(allergy));
                  }
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm transition-all
                  ${allergies.includes(allergy)
                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {allergy}
              </button>
            ))}
          </div>
        </div>

        {/* Custom allergy input */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="allergy"
              type="text"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
              placeholder="Add custom allergy or restriction"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAddAllergy}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm"
              >
                <AlertCircle className="w-3 h-3" />
                {allergy}
                <button
                  onClick={() => dispatch(removeAllergy(allergy))}
                  className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${allergy}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Diet Pattern */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Diet Pattern <span className="text-red-500">*</span>
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {dietPatterns.map(({ id, label, description, emoji }) => (
            <motion.button
              key={id}
              onClick={() => dispatch(setDietPattern(id))}
              className={`
                p-4 rounded-lg border-2 text-left transition-all duration-200
                ${dietPattern === id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Diet pattern: ${label}`}
              aria-pressed={dietPattern === id}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{emoji}</div>
                <div className="flex-1">
                  <div className={`font-semibold mb-1 ${dietPattern === id ? 'text-emerald-700' : 'text-gray-900'}`}>
                    {label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {description}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1
                  ${dietPattern === id ? 'border-emerald-500' : 'border-gray-300'}
                `}>
                  {dietPattern === id && (
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errors[4] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {errors[4]}
        </motion.div>
      )}
    </div>
  );
};

export default Step4DietaryPrefs;
