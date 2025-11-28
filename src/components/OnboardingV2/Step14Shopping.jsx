import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setShoppingPreferences } from '../../store/onboardingSlice';

const Step14Shopping = () => {
  const dispatch = useDispatch();
  const prefs = useSelector(state => state.onboarding.shoppingPreferences);
  const error = useSelector(state => state.onboarding.errors[14]);

  const [localData, setLocalData] = useState(prefs);

  const stores = [
    { id: 'online', label: 'Online Groceries', icon: '📱' },
    { id: 'supermarkets', label: 'Supermarkets', icon: '🏪' },
    { id: 'food_markets', label: 'Food Markets', icon: '🥬' },
    { id: 'local_stores', label: 'Local Stores', icon: '🛒' },
    { id: 'warehouse_clubs', label: 'Warehouse Clubs', icon: '📦' },
    { id: 'specialty_stores', label: 'Specialty Stores', icon: '🎯' }
  ];

  const frequencies = [
    { id: 'once_week', label: 'Once a week', icon: '1️⃣' },
    { id: 'twice_week', label: 'Twice a week', icon: '2️⃣' },
    { id: 'daily', label: 'Daily', icon: '📅' },
    { id: 'as_needed', label: 'As needed', icon: '🔄' }
  ];

  const toggleStore = (storeId) => {
    const updatedStores = localData.preferredStores.includes(storeId)
      ? localData.preferredStores.filter(s => s !== storeId)
      : [...localData.preferredStores, storeId];

    const newData = { ...localData, preferredStores: updatedStores };
    setLocalData(newData);
    dispatch(setShoppingPreferences(newData));
  };

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    dispatch(setShoppingPreferences(newData));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Tell us about your shopping habits</h3>
        <p className="text-gray-600">This helps us organize your grocery lists effectively</p>
      </div>

      {/* Preferred Stores */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <ShoppingCart className="inline mr-2" size={16} />
          Where do you usually shop? (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => toggleStore(store.id)}
              className={`p-3 rounded-xl border-2 transition-all ${
                localData.preferredStores.includes(store.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">{store.icon}</div>
              <div className="text-sm font-medium text-gray-800">{store.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Shopping Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Calendar className="inline mr-2" size={16} />
          How often do you shop?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {frequencies.map((freq) => (
            <button
              key={freq.id}
              onClick={() => handleChange('frequency', freq.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                localData.frequency === freq.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{freq.icon}</div>
              <div className="text-sm font-medium text-gray-800">{freq.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Organic Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Do you prefer organic products?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'yes', label: 'Yes, always', icon: '✓' },
            { id: 'no', label: 'No preference', icon: '○' },
            { id: 'when_affordable', label: 'When affordable', icon: '💰' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => handleChange('organic', option.id)}
              className={`p-3 rounded-xl border-2 transition-all ${
                localData.organic === option.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">{option.icon}</div>
              <div className="text-sm font-medium text-gray-800">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Buying */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Do you buy in bulk?
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleChange('bulkBuying', true)}
            className={`p-4 rounded-xl border-2 transition-all ${
              localData.bulkBuying === true
                ? 'border-primary bg-primary/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm font-medium text-gray-800">Yes</div>
            <div className="text-xs text-gray-600">Save money on staples</div>
          </button>
          <button
            onClick={() => handleChange('bulkBuying', false)}
            className={`p-4 rounded-xl border-2 transition-all ${
              localData.bulkBuying === false
                ? 'border-primary bg-primary/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">🥬</div>
            <div className="text-sm font-medium text-gray-800">No</div>
            <div className="text-xs text-gray-600">Prefer fresh ingredients</div>
          </button>
          <button
            onClick={() => handleChange('bulkBuying', null)}
            className={`p-4 rounded-xl border-2 transition-all ${
              localData.bulkBuying === null
                ? 'border-primary bg-primary/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">🤷</div>
            <div className="text-sm font-medium text-gray-800">No preference</div>
            <div className="text-xs text-gray-600">Either works</div>
          </button>
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

export default Step14Shopping;
