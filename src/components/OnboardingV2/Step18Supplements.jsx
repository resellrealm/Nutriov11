import React from 'react';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setSupplements } from '../../store/onboardingSlice';

const Step18Supplements = () => {
  const dispatch = useDispatch();
  const supplements = useSelector(state => state.onboarding.supplements);

  const supplementList = [
    { id: 'none', label: 'None', icon: '✓' },
    { id: 'multivitamin', label: 'Multivitamin', icon: '💊' },
    { id: 'protein_powder', label: 'Protein Powder', icon: '🥤' },
    { id: 'omega3', label: 'Omega-3/Fish Oil', icon: '🐟' },
    { id: 'vitamin_d', label: 'Vitamin D', icon: '☀️' },
    { id: 'b12', label: 'B12', icon: '🔴' },
    { id: 'iron', label: 'Iron', icon: '⚙️' },
    { id: 'calcium', label: 'Calcium', icon: '🦴' },
    { id: 'probiotics', label: 'Probiotics', icon: '🦠' }
  ];

  const toggleSupplement = (suppId) => {
    let newSupplements;

    if (suppId === 'none') {
      // If clicking "None", clear all others
      newSupplements = supplements.includes('none') ? [] : ['none'];
    } else {
      // If clicking any other supplement, remove "None"
      newSupplements = supplements
        .filter(s => s !== 'none')
        .includes(suppId)
        ? supplements.filter(s => s !== suppId && s !== 'none')
        : [...supplements.filter(s => s !== 'none'), suppId];
    }

    dispatch(setSupplements(newSupplements));
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Do you take any supplements?</h3>
        <p className="text-gray-600">Select all that apply (optional)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {supplementList.map((supplement) => (
          <button key={supplement.id} onClick={() => toggleSupplement(supplement.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              supplements.includes(supplement.id) ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <div className="text-2xl mb-2">{supplement.icon}</div>
            <div className="text-sm font-medium text-gray-800">{supplement.label}</div>
          </button>
        ))}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <Pill className="inline mr-1" size={14} />
          <strong>Note:</strong> This helps us account for nutrients you're already getting from supplements
        </p>
      </div>
    </motion.div>
  );
};

export default Step18Supplements;
