import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  Utensils,
  Activity,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    goals: [],
    diet: '',
    activityLevel: '',
    age: '',
    weight: '',
    height: '',
    targetWeight: ''
  });

  const goals = [
    { id: 'lose-weight', label: 'Lose Weight', icon: '⚖️' },
    { id: 'gain-muscle', label: 'Gain Muscle', icon: '💪' },
    { id: 'eat-healthier', label: 'Eat Healthier', icon: '🥗' },
    { id: 'maintain', label: 'Maintain Weight', icon: '✨' }
  ];

  const diets = [
    { id: 'omnivore', label: 'Omnivore', icon: '🍖' },
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'pescatarian', label: 'Pescatarian', icon: '🐟' },
    { id: 'keto', label: 'Keto', icon: '🥑' },
    { id: 'paleo', label: 'Paleo', icon: '🥩' },
    { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
    { id: 'halal', label: 'Halal', icon: '☪️' },
    { id: 'kosher', label: 'Kosher', icon: '✡️' }
  ];

  const activityLevels = [
    { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
    { id: 'light', label: 'Lightly Active', desc: '1-3 days/week' },
    { id: 'moderate', label: 'Moderately Active', desc: '3-5 days/week' },
    { id: 'very', label: 'Very Active', desc: '6-7 days/week' },
    { id: 'extra', label: 'Extra Active', desc: 'Very hard exercise' }
  ];

  const handleGoalToggle = (goalId) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('userDiet', formData.diet);
    localStorage.setItem('userGoals', JSON.stringify(formData.goals));
    toast.success('Welcome to Nutrio! Let\'s start your journey!');
    navigate('/');
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Welcome to Nutrio!</h2>
              </div>
              <span className="text-sm text-gray-600">Step {step} of 4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Goals */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">What are your goals?</h3>
              <p className="text-gray-600 mb-6">Select all that apply</p>
              
              <div className="grid grid-cols-2 gap-4">
                {goals.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.goals.includes(goal.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{goal.icon}</span>
                    <span className="font-medium text-gray-800">{goal.label}</span>
                    {formData.goals.includes(goal.id) && (
                      <Check className="inline ml-2 text-primary" size={16} />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Diet */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">What's your dietary preference?</h3>
              <p className="text-gray-600 mb-6">This helps us suggest better meals</p>
              
              <div className="grid grid-cols-3 gap-3">
                {diets.map(diet => (
                  <button
                    key={diet.id}
                    onClick={() => setFormData({ ...formData, diet: diet.id })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.diet === diet.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl mb-1 block">{diet.icon}</span>
                    <span className="text-sm font-medium text-gray-800">{diet.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Activity Level */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">How active are you?</h3>
              <p className="text-gray-600 mb-6">This helps calculate your calorie needs</p>
              
              <div className="space-y-3">
                {activityLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setFormData({ ...formData, activityLevel: level.id })}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.activityLevel === level.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-800">{level.label}</span>
                    <p className="text-sm text-gray-600 mt-1">{level.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Personal Info */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Tell us about yourself</h3>
              <p className="text-gray-600 mb-6">This helps personalize your nutrition goals</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Target Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="65"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center"
              >
                <ChevronLeft size={20} className="mr-1" />
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="ml-auto px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
              >
                Next
                <ChevronRight size={20} className="ml-1" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="ml-auto px-8 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Get Started!
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
