import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setFavoriteIngredients } from '../../store/onboardingSlice';

const Step10FavoriteFoods = () => {
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.onboarding.favoriteIngredients);
  const error = useSelector(state => state.onboarding.errors[10]);

  const [activeCategory, setActiveCategory] = useState('proteins');
  const [customInputs, setCustomInputs] = useState({});

  const foodCategories = {
    proteins: {
      label: 'Proteins',
      icon: '🍖',
      minRequired: 1,
      items: ['chicken', 'beef', 'fish', 'tofu', 'pork', 'turkey', 'lamb', 'eggs', 'shrimp', 'salmon', 'tuna', 'cod', 'duck', 'tempeh', 'seitan', 'beans', 'lentils', 'chickpeas', 'other']
    },
    vegetables: {
      label: 'Vegetables',
      icon: '🥬',
      minRequired: 5,
      items: ['broccoli', 'spinach', 'carrots', 'tomatoes', 'peppers', 'onions', 'garlic', 'mushrooms', 'zucchini', 'cauliflower', 'lettuce', 'cucumber', 'asparagus', 'kale', 'celery', 'green_beans', 'peas', 'corn', 'eggplant', 'brussels_sprouts', 'sweet_potato', 'cabbage', 'bok_choy', 'radish', 'beetroot', 'other']
    },
    fruits: {
      label: 'Fruits',
      icon: '🍎',
      minRequired: 3,
      items: ['apples', 'bananas', 'berries', 'oranges', 'grapes', 'mango', 'pineapple', 'avocado', 'strawberries', 'blueberries', 'watermelon', 'peaches', 'pears', 'kiwi', 'papaya', 'cherries', 'plums', 'raspberries', 'blackberries', 'cantaloupe', 'grapefruit', 'lemon', 'lime', 'coconut', 'other']
    },
    grains: {
      label: 'Grains',
      icon: '🌾',
      minRequired: 0,
      items: ['rice', 'pasta', 'bread', 'quinoa', 'oats', 'couscous', 'tortillas', 'barley', 'buckwheat', 'millet', 'bulgur', 'farro', 'rye', 'noodles', 'crackers', 'cereal', 'other']
    },
    snacks: {
      label: 'Snacks',
      icon: '🍿',
      minRequired: 0,
      items: ['nuts', 'yogurt', 'cheese', 'crackers', 'hummus', 'protein_bars', 'dark_chocolate', 'popcorn', 'granola', 'trail_mix', 'pretzels', 'rice_cakes', 'energy_balls', 'dried_fruit', 'seeds', 'nut_butter', 'other']
    }
  };

  const toggleItem = (category, item) => {
    const currentItems = favorites[category] || [];
    const newItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];

    dispatch(setFavoriteIngredients({ [category]: newItems }));
  };

  const handleCustomInput = (category, value) => {
    if (value.trim()) {
      const currentItems = favorites[category] || [];
      const customItem = `custom_${value.trim().toLowerCase().replace(/\s+/g, '_')}`;

      if (!currentItems.includes(customItem)) {
        dispatch(setFavoriteIngredients({
          [category]: [...currentItems, customItem]
        }));
      }

      setCustomInputs({ ...customInputs, [category]: '' });
    }
  };

  const getCategoryProgress = (category) => {
    const selected = (favorites[category] || []).length;
    const required = foodCategories[category].minRequired;
    return { selected, required, met: selected >= required };
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">What are your favorite foods?</h3>
        <p className="text-gray-600">Select foods you love - we'll prioritize them in meal plans</p>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {Object.keys(foodCategories).map((category) => {
          const progress = getCategoryProgress(category);
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{foodCategories[category].icon}</span>
              {foodCategories[category].label}
              <span className={`ml-2 text-xs ${progress.met ? 'opacity-100' : 'opacity-60'}`}>
                ({progress.selected}{progress.required > 0 ? `/${progress.required}` : ''})
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Requirements:</strong> 1+ protein, 5+ vegetables, 3+ fruits
        </p>
      </div>

      {/* Food Items */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {foodCategories[activeCategory].items.filter(item => item !== 'other').map((item) => (
          <button
            key={item}
            onClick={() => toggleItem(activeCategory, item)}
            className={`p-3 rounded-xl border-2 transition-all ${
              (favorites[activeCategory] || []).includes(item)
                ? 'border-primary bg-primary/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium text-gray-800 capitalize">
              {item.replace(/_/g, ' ')}
            </div>
            {(favorites[activeCategory] || []).includes(item) && (
              <Heart className="text-primary mx-auto mt-1" size={16} fill="currentColor" />
            )}
          </button>
        ))}
      </div>

      {/* Custom "Other" Input */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other {foodCategories[activeCategory].label} (custom):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Enter custom ${foodCategories[activeCategory].label.toLowerCase()}...`}
            value={customInputs[activeCategory] || ''}
            onChange={(e) => setCustomInputs({ ...customInputs, [activeCategory]: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCustomInput(activeCategory, e.target.value);
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <button
            onClick={() => handleCustomInput(activeCategory, customInputs[activeCategory])}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Add
          </button>
        </div>

        {/* Display custom items */}
        <div className="mt-3 flex flex-wrap gap-2">
          {(favorites[activeCategory] || [])
            .filter(item => item.startsWith('custom_'))
            .map((item) => (
              <div key={item} className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary rounded-full text-sm">
                <span className="capitalize">{item.replace('custom_', '').replace(/_/g, ' ')}</span>
                <button
                  onClick={() => toggleItem(activeCategory, item)}
                  className="text-primary hover:text-primary-dark"
                >
                  ×
                </button>
              </div>
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

export default Step10FavoriteFoods;
