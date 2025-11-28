import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Scale, Ruler } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setBasicInfo } from '../../store/onboardingSlice';

const Step2BasicInfo = () => {
  const dispatch = useDispatch();
  const basicInfo = useSelector(state => state.onboarding.basicInfo);
  const error = useSelector(state => state.onboarding.errors[2]);

  const [formData, setFormData] = useState({
    fullName: basicInfo.fullName || '',
    dateOfBirth: basicInfo.dateOfBirth || '',
    gender: basicInfo.gender || '',
    height: {
      value: basicInfo.height?.value || '',
      unit: basicInfo.height?.unit || 'cm'
    },
    currentWeight: {
      value: basicInfo.currentWeight?.value || '',
      unit: basicInfo.currentWeight?.unit || 'kg'
    },
    targetWeight: {
      value: basicInfo.targetWeight?.value || '',
      unit: basicInfo.targetWeight?.unit || 'kg'
    }
  });

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    dispatch(setBasicInfo(newData));
  };

  const handleNestedChange = (parent, child, value) => {
    const newData = {
      ...formData,
      [parent]: { ...formData[parent], [child]: value }
    };
    setFormData(newData);
    dispatch(setBasicInfo(newData));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">About You</h3>
        <p className="text-gray-600">Let's start with some basic information</p>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="inline mr-2" size={16} />
          Full Name
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your full name"
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline mr-2" size={16} />
          Date of Birth
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Sex */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Sex <span className="text-xs text-gray-500">(This helps get more accurate results)</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'prefer_not_to_say', label: 'Prefer not to say' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('gender', option.value)}
              className={`p-3 rounded-xl border-2 transition-all ${
                formData.gender === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Ruler className="inline mr-2" size={16} />
          Height
        </label>
        <div className="flex space-x-3">
          <input
            type="number"
            value={formData.height.value}
            onChange={(e) => handleNestedChange('height', 'value', parseFloat(e.target.value) || '')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="170"
          />
          <select
            value={formData.height.unit}
            onChange={(e) => handleNestedChange('height', 'unit', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="cm">cm</option>
            <option value="ft">ft</option>
          </select>
        </div>
      </div>

      {/* Current Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Scale className="inline mr-2" size={16} />
          Current Weight
        </label>
        <div className="flex space-x-3">
          <input
            type="number"
            value={formData.currentWeight.value}
            onChange={(e) => handleNestedChange('currentWeight', 'value', parseFloat(e.target.value) || '')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="70"
          />
          <select
            value={formData.currentWeight.unit}
            onChange={(e) => handleNestedChange('currentWeight', 'unit', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>
      </div>

      {/* Target Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Scale className="inline mr-2" size={16} />
          Target Weight
        </label>
        <div className="flex space-x-3">
          <input
            type="number"
            value={formData.targetWeight.value}
            onChange={(e) => handleNestedChange('targetWeight', 'value', parseFloat(e.target.value) || '')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="65"
          />
          <select
            value={formData.targetWeight.unit}
            onChange={(e) => handleNestedChange('targetWeight', 'unit', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
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

export default Step2BasicInfo;
