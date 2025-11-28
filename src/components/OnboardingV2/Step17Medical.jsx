import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setMedicalConditions } from '../../store/onboardingSlice';

const Step17Medical = () => {
  const dispatch = useDispatch();
  const conditions = useSelector(state => state.onboarding.medicalConditions);
  const [customInput, setCustomInput] = useState('');

  const medicalConditions = [
    { id: 'none', label: 'None', icon: '✓' },
    { id: 'diabetes_type1', label: 'Diabetes Type 1', icon: '💉' },
    { id: 'diabetes_type2', label: 'Diabetes Type 2', icon: '🩸' },
    { id: 'high_bp', label: 'High Blood Pressure', icon: '❤️' },
    { id: 'high_cholesterol', label: 'High Cholesterol', icon: '📊' },
    { id: 'heart_disease', label: 'Heart Disease', icon: '💓' },
    { id: 'pcos', label: 'PCOS', icon: '🔬' },
    { id: 'thyroid', label: 'Thyroid Issues', icon: '🦋' },
    { id: 'ibs', label: 'IBS/Digestive Issues', icon: '🌀' },
    { id: 'celiac', label: 'Celiac Disease', icon: '🌾' },
    { id: 'kidney_disease', label: 'Kidney Disease', icon: '🔬' },
    { id: 'liver_disease', label: 'Liver Disease', icon: '🏥' },
    { id: 'gout', label: 'Gout', icon: '🦴' },
    { id: 'arthritis', label: 'Arthritis', icon: '🦿' },
    { id: 'anemia', label: 'Anemia', icon: '🩸' },
    { id: 'crohns', label: "Crohn's Disease", icon: '🌀' },
    { id: 'ulcerative_colitis', label: 'Ulcerative Colitis', icon: '🔬' },
    { id: 'lactose_intolerance', label: 'Lactose Intolerance', icon: '🥛' },
    { id: 'food_allergies', label: 'Food Allergies', icon: '⚠️' }
  ];

  const toggleCondition = (conditionId) => {
    let newConditions;

    if (conditionId === 'none') {
      // If clicking "None", clear all others
      newConditions = conditions.includes('none') ? [] : ['none'];
    } else {
      // If clicking any other condition, remove "None"
      newConditions = conditions
        .filter(c => c !== 'none')
        .includes(conditionId)
        ? conditions.filter(c => c !== conditionId && c !== 'none')
        : [...conditions.filter(c => c !== 'none'), conditionId];
    }

    dispatch(setMedicalConditions(newConditions));
  };

  const handleCustomCondition = (value) => {
    if (value.trim()) {
      const customId = `custom_${value.trim().toLowerCase().replace(/\s+/g, '_')}`;
      if (!conditions.includes(customId)) {
        const newConditions = [...conditions.filter(c => c !== 'none'), customId];
        dispatch(setMedicalConditions(newConditions));
      }
      setCustomInput('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Any health conditions we should know about?</h3>
        <p className="text-gray-600">This step is optional but helps us provide better recommendations</p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3">
        <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-blue-800">
          <strong>Privacy Notice:</strong> This information helps us provide better recommendations. Your data is private and secure.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {medicalConditions.map((condition) => (
          <button key={condition.id} onClick={() => toggleCondition(condition.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              conditions.includes(condition.id) ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <div className="text-2xl mb-2">{condition.icon}</div>
            <div className="text-sm font-medium text-gray-800">{condition.label}</div>
          </button>
        ))}
      </div>

      {/* Custom "Other" Input */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other condition (optional):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter custom condition..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCustomCondition(e.target.value);
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <button
            onClick={() => handleCustomCondition(customInput)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Add
          </button>
        </div>

        {/* Display custom conditions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {conditions
            .filter(c => c.startsWith('custom_'))
            .map((condition) => (
              <div key={condition} className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary rounded-full text-sm">
                <span className="capitalize">{condition.replace('custom_', '').replace(/_/g, ' ')}</span>
                <button
                  onClick={() => toggleCondition(condition)}
                  className="text-primary hover:text-primary-dark"
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-sm text-gray-600">
          💡 This step is completely optional - skip it if you prefer not to share health information
        </p>
      </div>
    </motion.div>
  );
};

export default Step17Medical;
