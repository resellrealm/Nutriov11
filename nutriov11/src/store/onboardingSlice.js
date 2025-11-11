import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStep: 1,
  totalSteps: 6,
  isComplete: false,
  lastSaved: null,
  
  // Step 1: Diary Style
  diaryStyle: null, // 'simple' | 'detailed'
  
  // Step 2: Goals
  weightGoal: null, // 'lose' | 'maintain' | 'gain'
  pace: null, // 'slow' | 'moderate' | 'fast'
  targetDate: null,
  targetWeight: null,
  
  // Step 3: Body Metrics
  currentWeight: null,
  height: null,
  sex: null, // 'male' | 'female' | 'other'
  age: null,
  weightUnit: 'kg', // 'kg' | 'lbs'
  heightUnit: 'cm', // 'cm' | 'ft'
  
  // Step 4: Dietary Preferences
  cuisines: [], // ['italian', 'asian', 'mexican', etc.]
  favoriteFoods: [], // array of food items
  allergies: [], // ['nuts', 'dairy', 'gluten', etc.]
  dietPattern: null, // 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo'
  
  // Step 5: Activity Level
  activityLevel: null, // 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  
  // Step 6: Time Constraints
  maxCookTime: null, // minutes
  mealsPerDay: null, // 2-6
  budget: null, // 'low' | 'medium' | 'high'
  cookingSkill: null, // 'beginner' | 'intermediate' | 'advanced'
  
  // Validation state
  stepValidation: {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  },
  
  // Error tracking
  errors: {}
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    // Navigation
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps && state.stepValidation[state.currentStep]) {
        state.currentStep += 1;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    
    // Step 1: Diary Style
    setDiaryStyle: (state, action) => {
      state.diaryStyle = action.payload;
      state.stepValidation[1] = true;
      state.errors[1] = null;
    },
    
    // Step 2: Goals
    setWeightGoal: (state, action) => {
      state.weightGoal = action.payload;
      onboardingSlice.caseReducers.validateStep2(state);
    },
    
    setPace: (state, action) => {
      state.pace = action.payload;
      onboardingSlice.caseReducers.validateStep2(state);
    },
    
    setTargetDate: (state, action) => {
      state.targetDate = action.payload;
      onboardingSlice.caseReducers.validateStep2(state);
    },
    
    setTargetWeight: (state, action) => {
      state.targetWeight = action.payload;
      onboardingSlice.caseReducers.validateStep2(state);
    },
    
    validateStep2: (state) => {
      const isValid = state.weightGoal && state.pace && state.targetDate;
      state.stepValidation[2] = isValid;
      state.errors[2] = isValid ? null : 'Please complete all goal fields';
    },
    
    // Step 3: Body Metrics
    setCurrentWeight: (state, action) => {
      state.currentWeight = action.payload;
      onboardingSlice.caseReducers.validateStep3(state);
    },
    
    setHeight: (state, action) => {
      state.height = action.payload;
      onboardingSlice.caseReducers.validateStep3(state);
    },
    
    setSex: (state, action) => {
      state.sex = action.payload;
      onboardingSlice.caseReducers.validateStep3(state);
    },
    
    setAge: (state, action) => {
      state.age = action.payload;
      onboardingSlice.caseReducers.validateStep3(state);
    },
    
    setWeightUnit: (state, action) => {
      state.weightUnit = action.payload;
    },
    
    setHeightUnit: (state, action) => {
      state.heightUnit = action.payload;
    },
    
    validateStep3: (state) => {
      const isValid = 
        state.currentWeight > 0 &&
        state.height > 0 &&
        state.sex &&
        state.age >= 13 && state.age <= 120;
      
      state.stepValidation[3] = isValid;
      
      if (!isValid) {
        if (state.age < 13) state.errors[3] = 'You must be at least 13 years old';
        else if (state.age > 120) state.errors[3] = 'Please enter a valid age';
        else state.errors[3] = 'Please complete all body metrics';
      } else {
        state.errors[3] = null;
      }
    },
    
    // Step 4: Dietary Preferences
    addCuisine: (state, action) => {
      if (!state.cuisines.includes(action.payload)) {
        state.cuisines.push(action.payload);
      }
      onboardingSlice.caseReducers.validateStep4(state);
    },
    
    removeCuisine: (state, action) => {
      state.cuisines = state.cuisines.filter(c => c !== action.payload);
      onboardingSlice.caseReducers.validateStep4(state);
    },
    
    addFavoriteFood: (state, action) => {
      if (!state.favoriteFoods.includes(action.payload)) {
        state.favoriteFoods.push(action.payload);
      }
    },
    
    removeFavoriteFood: (state, action) => {
      state.favoriteFoods = state.favoriteFoods.filter(f => f !== action.payload);
    },
    
    addAllergy: (state, action) => {
      if (!state.allergies.includes(action.payload)) {
        state.allergies.push(action.payload);
      }
      onboardingSlice.caseReducers.validateStep4(state);
    },
    
    removeAllergy: (state, action) => {
      state.allergies = state.allergies.filter(a => a !== action.payload);
      onboardingSlice.caseReducers.validateStep4(state);
    },
    
    setDietPattern: (state, action) => {
      state.dietPattern = action.payload;
      onboardingSlice.caseReducers.validateStep4(state);
    },
    
    validateStep4: (state) => {
      const isValid = state.cuisines.length > 0 && state.dietPattern;
      state.stepValidation[4] = isValid;
      state.errors[4] = isValid ? null : 'Please select at least one cuisine and a diet pattern';
    },
    
    // Step 5: Activity Level
    setActivityLevel: (state, action) => {
      state.activityLevel = action.payload;
      state.stepValidation[5] = true;
      state.errors[5] = null;
    },
    
    // Step 6: Time Constraints
    setMaxCookTime: (state, action) => {
      state.maxCookTime = action.payload;
      onboardingSlice.caseReducers.validateStep6(state);
    },
    
    setMealsPerDay: (state, action) => {
      state.mealsPerDay = action.payload;
      onboardingSlice.caseReducers.validateStep6(state);
    },
    
    setBudget: (state, action) => {
      state.budget = action.payload;
      onboardingSlice.caseReducers.validateStep6(state);
    },
    
    setCookingSkill: (state, action) => {
      state.cookingSkill = action.payload;
      onboardingSlice.caseReducers.validateStep6(state);
    },
    
    validateStep6: (state) => {
      const isValid = 
        state.maxCookTime > 0 &&
        state.mealsPerDay >= 2 && state.mealsPerDay <= 6 &&
        state.budget &&
        state.cookingSkill;
      
      state.stepValidation[6] = isValid;
      state.errors[6] = isValid ? null : 'Please complete all time constraint fields';
    },
    
    // Save & Resume
    saveProgress: (state) => {
      state.lastSaved = new Date().toISOString();
      // In real app, this would trigger localStorage/API save
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_progress', JSON.stringify(state));
      }
    },
    
    loadProgress: (state, action) => {
      return { ...state, ...action.payload, lastSaved: new Date().toISOString() };
    },
    
    // Complete onboarding
    completeOnboarding: (state) => {
      state.isComplete = true;
      state.lastSaved = new Date().toISOString();
    },
    
    // Reset
    resetOnboarding: () => initialState
  }
});

export const {
  setStep,
  nextStep,
  previousStep,
  setDiaryStyle,
  setWeightGoal,
  setPace,
  setTargetDate,
  setTargetWeight,
  setCurrentWeight,
  setHeight,
  setSex,
  setAge,
  setWeightUnit,
  setHeightUnit,
  addCuisine,
  removeCuisine,
  addFavoriteFood,
  removeFavoriteFood,
  addAllergy,
  removeAllergy,
  setDietPattern,
  setActivityLevel,
  setMaxCookTime,
  setMealsPerDay,
  setBudget,
  setCookingSkill,
  saveProgress,
  loadProgress,
  completeOnboarding,
  resetOnboarding
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
