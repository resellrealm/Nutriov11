import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import { nextStep, previousStep, saveProgress, completeOnboarding } from '../../store/onboardingSlice';

// Import step components
import Step1DiaryStyle from './Step1DiaryStyle';
import Step2Goals from './Step2Goals';
import Step3BodyMetrics from './Step3BodyMetrics';
import Step4DietaryPrefs from './Step4DietaryPrefs';
import Step5ActivityLevel from './Step5ActivityLevel';
import Step6TimeConstraints from './Step6TimeConstraints';

const OnboardingFlow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    currentStep, 
    totalSteps, 
    stepValidation, 
    lastSaved 
  } = useSelector(state => state.onboarding);
  
  // Autosave every 30 seconds
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      dispatch(saveProgress());
    }, 30000);
    
    return () => clearInterval(autosaveInterval);
  }, [dispatch]);
  
  // Save on unmount
  useEffect(() => {
    return () => {
      dispatch(saveProgress());
    };
  }, [dispatch]);
  
  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && stepValidation[currentStep]) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStep > 1) {
        handlePrevious();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, stepValidation]);
  
  const handleNext = () => {
    if (currentStep === totalSteps) {
      handleComplete();
    } else {
      dispatch(nextStep());
    }
  };
  
  const handlePrevious = () => {
    dispatch(previousStep());
  };
  
  const handleSave = () => {
    dispatch(saveProgress());
  };
  
  const handleComplete = () => {
    dispatch(completeOnboarding());
    navigate('/dashboard');
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1DiaryStyle />;
      case 2:
        return <Step2Goals />;
      case 3:
        return <Step3BodyMetrics />;
      case 4:
        return <Step4DietaryPrefs />;
      case 5:
        return <Step5ActivityLevel />;
      case 6:
        return <Step6TimeConstraints />;
      default:
        return null;
    }
  };
  
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header with Progress */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-xs text-gray-500">
                {lastSaved && `Saved ${new Date(lastSaved).toLocaleTimeString()}`}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {[...Array(totalSteps)].map((_, index) => {
              const stepNum = index + 1;
              const isCompleted = stepValidation[stepNum];
              const isCurrent = stepNum === currentStep;
              
              return (
                <div key={stepNum} className="flex items-center">
                  <motion.div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${isCurrent 
                        ? 'bg-emerald-500 text-white scale-110 shadow-lg' 
                        : isCompleted 
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-200 text-gray-400'
                      }
                    `}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-semibold">{stepNum}</span>
                    )}
                  </motion.div>
                  {stepNum < totalSteps && (
                    <div 
                      className={`
                        w-8 sm:w-12 h-1 mx-1
                        ${stepValidation[stepNum] ? 'bg-emerald-500' : 'bg-gray-200'}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg
                transition-all duration-200
                ${currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              aria-label="Previous step"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Save progress"
            >
              <Save className="w-5 h-5" />
              <span className="hidden sm:inline">Save</span>
            </button>
            
            {/* Next/Complete Button */}
            <button
              onClick={handleNext}
              disabled={!stepValidation[currentStep]}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg
                transition-all duration-200 font-medium
                ${!stepValidation[currentStep]
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:scale-105'
                }
              `}
              aria-label={currentStep === totalSteps ? 'Complete onboarding' : 'Next step'}
            >
              <span>
                {currentStep === totalSteps ? 'Complete' : 'Next'}
              </span>
              {currentStep === totalSteps ? (
                <Check className="w-5 h-5" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Error Message */}
          {!stepValidation[currentStep] && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600 text-center"
            >
              Please complete all required fields to continue
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
