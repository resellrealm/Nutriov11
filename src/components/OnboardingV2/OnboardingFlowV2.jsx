import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// Import all 20 onboarding steps
import Step1Welcome from './Step1Welcome';
import Step2BasicInfo from './Step2BasicInfo';
import Step3PrimaryGoal from './Step3PrimaryGoal';
import Step4Timeline from './Step4Timeline';
import Step5Activity from './Step5Activity';
import Step6Exercise from './Step6Exercise';
import Step7DietaryRestrictions from './Step7DietaryRestrictions';
import Step8Allergies from './Step8Allergies';
import Step9CuisinePreferences from './Step9CuisinePreferences';
import Step10FavoriteFoods from './Step10FavoriteFoods';
import Step11DislikedFoods from './Step11DislikedFoods';
import Step12Household from './Step12Household';
import Step13Budget from './Step13Budget';
import Step14Shopping from './Step14Shopping';
import Step15MealTiming from './Step15MealTiming';
import Step16Cooking from './Step16Cooking';
import Step17Medical from './Step17Medical';
import Step18Supplements from './Step18Supplements';
import Step19Notifications from './Step19Notifications';
import Step20Summary from './Step20Summary';

// Services
import { updateOnboardingProgress, completeOnboarding, calculateAllMetrics } from '../../services/userService';
import { nextStep, previousStep, saveProgress, completeOnboarding as completeOnboardingRedux } from '../../store/onboardingSlice';
import { setOnboardingComplete } from '../../store/authSlice';

const OnboardingFlowV2 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentStep = useSelector(state => state.onboarding.currentStep);
  const totalSteps = useSelector(state => state.onboarding.totalSteps);
  const stepValidation = useSelector(state => state.onboarding.stepValidation);
  const onboardingData = useSelector(state => state.onboarding);
  const userId = useSelector(state => state.auth.user?.id);
  const hasCompletedOnboarding = useSelector(state => state.auth.hasCompletedOnboarding);

  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Redirect to dashboard if onboarding is already complete
  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate('/');
    }
  }, [hasCompletedOnboarding, navigate]);

  // Step components mapping
  const stepComponents = {
    1: Step1Welcome,
    2: Step2BasicInfo,
    3: Step3PrimaryGoal,
    4: Step4Timeline,
    5: Step5Activity,
    6: Step6Exercise,
    7: Step7DietaryRestrictions,
    8: Step8Allergies,
    9: Step9CuisinePreferences,
    10: Step10FavoriteFoods,
    11: Step11DislikedFoods,
    12: Step12Household,
    13: Step13Budget,
    14: Step14Shopping,
    15: Step15MealTiming,
    16: Step16Cooking,
    17: Step17Medical,
    18: Step18Supplements,
    19: Step19Notifications,
    20: Step20Summary
  };

  const CurrentStepComponent = stepComponents[currentStep];

  // Auto-save progress to Firebase after each step
  useEffect(() => {
    if (userId && currentStep > 1) {
      saveProgressToFirebase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, userId]);

  const saveProgressToFirebase = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      // Convert Redux state to Firebase format
      const dataToSave = {
        'onboarding.currentScreen': currentStep,
        'onboarding.started': true,
        basicInfo: onboardingData.basicInfo,
        'goals.primary': onboardingData.primaryGoal,
        'goals.timeline': onboardingData.timeline,
        'goals.activityLevel': onboardingData.activityLevel,
        exercise: onboardingData.exercise,
        'dietary.restrictions': onboardingData.dietaryRestrictions,
        'dietary.allergies': onboardingData.allergies,
        'dietary.cuisinePreferences': onboardingData.cuisinePreferences,
        'dietary.favoriteIngredients': onboardingData.favoriteIngredients,
        'dietary.dislikedFoods': onboardingData.dislikedFoods,
        household: onboardingData.household,
        budget: onboardingData.budget,
        shoppingPreferences: onboardingData.shoppingPreferences,
        mealTiming: onboardingData.mealTiming,
        cookingHabits: onboardingData.cookingHabits,
        'health.medicalConditions': onboardingData.medicalConditions,
        'health.supplements': onboardingData.supplements,
        notifications: onboardingData.notifications
      };

      const result = await updateOnboardingProgress(userId, currentStep, dataToSave);
      if (result.success) {
        dispatch(saveProgress());
      } else {
        console.error('Failed to save progress:', result.error);
        // Don't show error toast for background saves to avoid annoying user
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!stepValidation[currentStep]) {
      toast.error('Please complete all required fields');
      return;
    }

    if (currentStep === totalSteps) {
      await handleComplete();
    } else {
      dispatch(nextStep());
    }
  };

  const handlePrevious = () => {
    dispatch(previousStep());
  };

  const handleComplete = async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    setIsCompleting(true);
    try {
      // Calculate BMI, TDEE, and Macros
      const calculatedMetrics = calculateAllMetrics({
        basicInfo: onboardingData.basicInfo,
        goals: {
          primary: onboardingData.primaryGoal,
          activityLevel: onboardingData.activityLevel
        },
        exercise: onboardingData.exercise
      });

      // Save to Firebase
      const result = await completeOnboarding(userId, calculatedMetrics);

      if (result.success) {
        // Update Redux
        dispatch(completeOnboardingRedux());
        dispatch(setOnboardingComplete(true));

        // Set localStorage flag
        localStorage.setItem('onboardingComplete', 'true');

        toast.success('Welcome to Nutrio! Your personalized plan is ready!', {
          duration: 4000,
          icon: '🎉'
        });

        // Navigate to dashboard
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header with Progress */}
        <div className="bg-white rounded-t-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Nutrio Setup</h2>
                <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>
            {isSaving && (
              <div className="text-xs text-gray-500 flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white shadow-xl p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {CurrentStepComponent && <CurrentStepComponent onNext={handleNext} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                disabled={isSaving || isCompleting}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} className="mr-1" />
                Back
              </button>
            )}

            {currentStep === 1 && <div />}

            {/* Next/Complete Button */}
            <button
              onClick={handleNext}
              disabled={!stepValidation[currentStep] || isSaving || isCompleting}
              className="ml-auto px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Completing...
                </>
              ) : currentStep === totalSteps ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ChevronRight size={20} className="ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Skip/Optional Text for Optional Steps */}
          {(currentStep === 11 || currentStep === 17 || currentStep === 18) && (
            <div className="mt-4 text-center">
              <button
                onClick={handleNext}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip this step →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlowV2;
