import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Edit, User, Target, Utensils, ShoppingCart, DollarSign } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { confirmSummary, setStep } from '../../store/onboardingSlice';

const Step20Summary = () => {
  const dispatch = useDispatch();
  const onboarding = useSelector(state => state.onboarding);
  const { basicInfo, primaryGoal, household, budget, cuisinePreferences, dietaryRestrictions } = onboarding;

  const handleEdit = (stepNumber) => {
    dispatch(setStep(stepNumber));
  };

  const _handleConfirm = () => {
    dispatch(confirmSummary());
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-white" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Almost Done!</h3>
        <p className="text-gray-600">Review your information before we create your personalized plan</p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <User className="text-primary" size={20} />
              <h4 className="font-semibold text-gray-800">Basic Information</h4>
            </div>
            <button onClick={() => handleEdit(2)} className="text-primary hover:text-primary/80 text-sm flex items-center">
              <Edit size={14} className="mr-1" /> Edit
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Name:</strong> {basicInfo.fullName || 'Not provided'}</p>
            <p><strong>Age:</strong> {basicInfo.age || 'Not calculated'} years</p>
            <p><strong>Gender:</strong> {basicInfo.gender?.replace('_', ' ') || 'Not provided'}</p>
            <p><strong>Current Weight:</strong> {basicInfo.currentWeight?.value} {basicInfo.currentWeight?.unit}</p>
            <p><strong>Target Weight:</strong> {basicInfo.targetWeight?.value} {basicInfo.targetWeight?.unit}</p>
          </div>
        </div>

        {/* Goals */}
        <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="text-primary" size={20} />
              <h4 className="font-semibold text-gray-800">Your Goals</h4>
            </div>
            <button onClick={() => handleEdit(3)} className="text-primary hover:text-primary/80 text-sm flex items-center">
              <Edit size={14} className="mr-1" /> Edit
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Primary Goal:</strong> {primaryGoal?.replace('_', ' ') || 'Not set'}</p>
            <p><strong>Activity Level:</strong> {onboarding.activityLevel?.replace('_', ' ') || 'Not set'}</p>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Utensils className="text-primary" size={20} />
              <h4 className="font-semibold text-gray-800">Dietary Preferences</h4>
            </div>
            <button onClick={() => handleEdit(7)} className="text-primary hover:text-primary/80 text-sm flex items-center">
              <Edit size={14} className="mr-1" /> Edit
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Restrictions:</strong> {dietaryRestrictions.join(', ') || 'None'}</p>
            <p><strong>Favorite Cuisines:</strong> {cuisinePreferences.length} selected</p>
          </div>
        </div>

        {/* Household & Budget */}
        <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="text-primary" size={20} />
              <h4 className="font-semibold text-gray-800">Household & Budget</h4>
            </div>
            <button onClick={() => handleEdit(12)} className="text-primary hover:text-primary/80 text-sm flex items-center">
              <Edit size={14} className="mr-1" /> Edit
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Household Size:</strong> {household.totalMembers} people</p>
            {household.hasChildren && <p><strong>Children:</strong> {household.childrenCount}</p>}
            <p><strong>Weekly Budget:</strong> {budget.currency} {budget.weekly}</p>
            <p><strong>Budget Priority:</strong> {budget.priority?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-2">What happens next?</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>We'll calculate your personalized calorie and macro targets</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Create your first week's meal plan based on your preferences</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Generate a smart grocery list within your budget</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Set up your personalized dashboard</span>
          </li>
        </ul>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-500 mb-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </motion.div>
  );
};

export default Step20Summary;
