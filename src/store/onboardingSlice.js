import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStep: 1,
  totalSteps: 20,
  isComplete: false,
  lastSaved: null,

  // Screen 1: Welcome (just acknowledgment)
  welcomeAcknowledged: false,

  // Screen 2: Basic Information
  basicInfo: {
    fullName: '',
    dateOfBirth: null,
    age: null,
    gender: '',
    height: { value: null, unit: 'cm' },
    currentWeight: { value: null, unit: 'kg' },
    targetWeight: { value: null, unit: 'kg' }
  },

  // Screen 3: Primary Health Goal
  primaryGoal: '', // 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_health' | 'manage_condition' | 'athletic_performance'

  // Screen 4: Target Timeline
  timeline: '', // '1-3_months' | '3-6_months' | '6-12_months' | '1+_year' | 'no_timeline'

  // Screen 5: Activity Level
  activityLevel: '', // 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'

  // Screen 6: Exercise Routine Details
  exercise: {
    types: [], // ['cardio', 'strength', 'yoga', 'sports', 'walking', 'cycling', 'swimming', 'other']
    avgDuration: 30, // minutes
    frequency: 0 // days per week
  },

  // Screen 7: Dietary Restrictions & Preferences
  dietaryRestrictions: [], // ['none', 'vegetarian', 'vegan', 'pescatarian', 'omnivore', 'paleo', 'keto', 'low_carb', 'gluten_free', 'dairy_free', 'halal', 'kosher']

  // Screen 8: Food Allergies & Intolerances
  allergies: [], // ['none', 'peanuts', 'tree_nuts', 'shellfish', 'fish', 'eggs', 'dairy', 'soy', 'wheat', 'sesame', 'other:...']

  // Screen 9: Cuisine Preferences (CRITICAL for grocery list)
  cuisinePreferences: [], // ['italian', 'mexican', 'asian', 'indian', 'mediterranean', 'middle_eastern', 'american', 'french', 'caribbean', 'african', 'latin_american', 'european']

  // Screen 10: Favorite Foods
  favoriteIngredients: {
    proteins: [], // ['chicken', 'beef', 'fish', 'tofu', 'pork', 'turkey', 'lamb', 'eggs']
    vegetables: [], // ['broccoli', 'spinach', 'carrots', 'tomatoes', 'peppers', 'onions', 'garlic', 'mushrooms', 'zucchini', 'cauliflower']
    fruits: [], // ['apples', 'bananas', 'berries', 'oranges', 'grapes', 'mango', 'pineapple', 'avocado']
    grains: [], // ['rice', 'pasta', 'bread', 'quinoa', 'oats', 'couscous']
    snacks: [] // ['nuts', 'yogurt', 'cheese', 'crackers', 'hummus', 'protein_bars']
  },

  // Screen 11: Foods to Avoid
  dislikedFoods: [], // array of food items

  // Screen 12: Household & Shopping Information (CRITICAL for grocery list)
  household: {
    totalMembers: 1,
    hasChildren: false,
    childrenCount: 0,
    childrenAges: [], // [7, 12] etc
    feedingOthers: [], // ['just_myself', 'partner', 'family', 'housemates', 'friends']
    adultCount: 1
  },

  // Screen 13: Budget Settings (CRITICAL for grocery list)
  budget: {
    weekly: 0,
    currency: 'USD',
    priority: 'flexible', // 'strict' | 'flexible' | 'no_limit'
    perPerson: 0
  },

  // Screen 14: Shopping Preferences
  shoppingPreferences: {
    preferredStores: [], // ['whole_foods', 'trader_joes', 'walmart', 'costco', 'local_markets', 'online_delivery']
    frequency: '', // 'once_week' | 'twice_week' | 'daily' | 'as_needed'
    organic: 'when_affordable', // 'yes' | 'no' | 'when_affordable'
    bulkBuying: false
  },

  // Screen 15: Meal Timing & Habits
  mealTiming: {
    mealsPerDay: 3,
    snacksPerDay: 2,
    breakfastTime: '08:00',
    lunchTime: '13:00',
    dinnerTime: '19:00',
    mealPreps: '', // 'yes_regularly' | 'sometimes' | 'no'
    intermittentFasting: false,
    fastingWindow: '' // '16:8', '18:6', etc
  },

  // Screen 16: Cooking Habits
  cookingHabits: {
    skillLevel: '', // 'beginner' | 'intermediate' | 'advanced' | 'expert'
    timeAvailable: {
      breakfast: 15,
      lunch: 30,
      dinner: 45
    },
    preferredMethods: [], // ['stove', 'oven', 'microwave', 'slow_cooker', 'air_fryer', 'instant_pot', 'grill']
    kitchenEquipment: [] // ['blender', 'food_processor', 'mixer', 'rice_cooker', 'toaster', 'juicer']
  },

  // Screen 17: Medical Conditions & Health Goals
  medicalConditions: [], // ['none', 'diabetes_type1', 'diabetes_type2', 'high_bp', 'high_cholesterol', 'heart_disease', 'pcos', 'thyroid', 'ibs', 'other:...']

  // Screen 18: Supplement Intake
  supplements: [], // ['none', 'multivitamin', 'protein_powder', 'omega3', 'vitamin_d', 'b12', 'iron', 'calcium', 'probiotics', 'other:...']

  // Screen 19: Notification Preferences
  notifications: {
    mealReminders: { enabled: false, times: [] },
    waterReminders: { enabled: false, frequency: 'hourly' },
    groceryReminders: { enabled: false, dayOfWeek: 'sunday' },
    progressCheckIns: { enabled: false, frequency: 'weekly' },
    recipeSuggestions: false,
    achievements: false
  },

  // Screen 20: Summary & Confirmation (no data stored, just confirmation)
  summaryConfirmed: false,
  termsAccepted: false,
  editingFromReview: false, // Track if user is editing from review page

  // Validation state for each step
  stepValidation: {
    1: false, 2: false, 3: false, 4: false, 5: false,
    6: false, 7: false, 8: false, 9: false, 10: false,
    11: false, 12: false, 13: false, 14: false, 15: false,
    16: false, 17: false, 18: false, 19: false, 20: false
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
      if (action.payload >= 1 && action.payload <= state.totalSteps) {
        state.currentStep = action.payload;
      }
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

    // Screen 1: Welcome
    acknowledgeWelcome: (state) => {
      state.welcomeAcknowledged = true;
      state.stepValidation[1] = true;
    },

    // Screen 2: Basic Information
    setBasicInfo: (state, action) => {
      state.basicInfo = { ...state.basicInfo, ...action.payload };
      onboardingSlice.caseReducers.validateStep2(state);
    },

    validateStep2: (state) => {
      const { fullName, dateOfBirth, gender, height, currentWeight, targetWeight } = state.basicInfo;
      const isValid =
        fullName.trim().length > 0 &&
        dateOfBirth &&
        gender &&
        height.value > 0 &&
        currentWeight.value > 0 &&
        targetWeight.value > 0;

      state.stepValidation[2] = isValid;
      state.errors[2] = isValid ? null : 'Please complete all fields';

      // Calculate age from date of birth
      if (dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        state.basicInfo.age = age;
      }
    },

    // Screen 3: Primary Goal
    setPrimaryGoal: (state, action) => {
      state.primaryGoal = action.payload;
      state.stepValidation[3] = true;
      state.errors[3] = null;
    },

    // Screen 4: Timeline
    setTimeline: (state, action) => {
      state.timeline = action.payload;
      state.stepValidation[4] = true;
      state.errors[4] = null;
    },

    // Screen 5: Activity Level
    setActivityLevel: (state, action) => {
      state.activityLevel = action.payload;
      state.stepValidation[5] = true;
      state.errors[5] = null;
    },

    // Screen 6: Exercise Details
    setExercise: (state, action) => {
      state.exercise = { ...state.exercise, ...action.payload };
      onboardingSlice.caseReducers.validateStep6(state);
    },

    validateStep6: (state) => {
      const { types, frequency } = state.exercise;
      const isValid = types.length > 0 && frequency >= 0 && frequency <= 7;
      state.stepValidation[6] = isValid;
      state.errors[6] = isValid ? null : 'Please select at least one exercise type';
    },

    // Screen 7: Dietary Restrictions
    setDietaryRestrictions: (state, action) => {
      state.dietaryRestrictions = action.payload;
      state.stepValidation[7] = state.dietaryRestrictions.length > 0;
      state.errors[7] = null;
    },

    toggleDietaryRestriction: (state, action) => {
      const restriction = action.payload;
      if (state.dietaryRestrictions.includes(restriction)) {
        state.dietaryRestrictions = state.dietaryRestrictions.filter(r => r !== restriction);
      } else {
        state.dietaryRestrictions.push(restriction);
      }
      state.stepValidation[7] = state.dietaryRestrictions.length > 0;
    },

    // Screen 8: Allergies (REQUIRED - must select at least "none")
    setAllergies: (state, action) => {
      state.allergies = action.payload;
      state.stepValidation[8] = state.allergies.length > 0;
      state.errors[8] = state.allergies.length > 0 ? null : 'Please select allergies or "None"';
    },

    toggleAllergy: (state, action) => {
      const allergy = action.payload;
      if (state.allergies.includes(allergy)) {
        state.allergies = state.allergies.filter(a => a !== allergy);
      } else {
        state.allergies.push(allergy);
      }
      state.stepValidation[8] = state.allergies.length > 0;
      state.errors[8] = state.allergies.length > 0 ? null : 'Please select allergies or "None"';
    },

    // Screen 9: Cuisine Preferences (CRITICAL - minimum 3)
    setCuisinePreferences: (state, action) => {
      state.cuisinePreferences = action.payload;
      onboardingSlice.caseReducers.validateStep9(state);
    },

    toggleCuisinePreference: (state, action) => {
      const cuisine = action.payload;
      if (state.cuisinePreferences.includes(cuisine)) {
        state.cuisinePreferences = state.cuisinePreferences.filter(c => c !== cuisine);
      } else {
        state.cuisinePreferences.push(cuisine);
      }
      onboardingSlice.caseReducers.validateStep9(state);
    },

    validateStep9: (state) => {
      const isValid = state.cuisinePreferences.length >= 3;
      state.stepValidation[9] = isValid;
      state.errors[9] = isValid ? null : 'Please select at least 3 cuisines';
    },

    // Screen 10: Favorite Foods
    setFavoriteIngredients: (state, action) => {
      state.favoriteIngredients = { ...state.favoriteIngredients, ...action.payload };
      onboardingSlice.caseReducers.validateStep10(state);
    },

    validateStep10: (state) => {
      const { vegetables, fruits, proteins } = state.favoriteIngredients;
      const isValid = vegetables.length >= 5 && fruits.length >= 3 && proteins.length >= 1;
      state.stepValidation[10] = isValid;
      state.errors[10] = isValid ? null : 'Select at least 5 vegetables, 3 fruits, and 1 protein';
    },

    // Screen 11: Disliked Foods
    setDislikedFoods: (state, action) => {
      state.dislikedFoods = action.payload;
      state.stepValidation[11] = true; // Optional
      state.errors[11] = null;
    },

    // Screen 12: Household Info (CRITICAL)
    setHousehold: (state, action) => {
      state.household = { ...state.household, ...action.payload };
      onboardingSlice.caseReducers.validateStep12(state);
    },

    validateStep12: (state) => {
      const { totalMembers, hasChildren, childrenCount, childrenAges } = state.household;

      // Calculate adult count
      state.household.adultCount = totalMembers - childrenCount;

      // Validate
      const isValid = totalMembers >= 1 &&
        (!hasChildren || (hasChildren && childrenCount > 0 && childrenAges.length === childrenCount));

      state.stepValidation[12] = isValid;
      state.errors[12] = isValid ? null : 'Please complete household information';
    },

    // Screen 13: Budget (CRITICAL)
    setBudget: (state, action) => {
      state.budget = { ...state.budget, ...action.payload };
      onboardingSlice.caseReducers.validateStep13(state);
    },

    validateStep13: (state) => {
      const { weekly, currency, priority } = state.budget;

      // Calculate per person budget
      if (weekly > 0 && state.household.totalMembers > 0) {
        state.budget.perPerson = Math.round(weekly / state.household.totalMembers);
      }

      const isValid = weekly > 0 && currency && priority;
      state.stepValidation[13] = isValid;
      state.errors[13] = isValid ? null : 'Please set your weekly budget';
    },

    // Screen 14: Shopping Preferences
    setShoppingPreferences: (state, action) => {
      state.shoppingPreferences = { ...state.shoppingPreferences, ...action.payload };
      onboardingSlice.caseReducers.validateStep14(state);
    },

    validateStep14: (state) => {
      const { frequency } = state.shoppingPreferences;
      const isValid = frequency !== '';
      state.stepValidation[14] = isValid;
      state.errors[14] = isValid ? null : 'Please select shopping frequency';
    },

    // Screen 15: Meal Timing
    setMealTiming: (state, action) => {
      state.mealTiming = { ...state.mealTiming, ...action.payload };
      onboardingSlice.caseReducers.validateStep15(state);
    },

    validateStep15: (state) => {
      const { mealsPerDay, breakfastTime, lunchTime, dinnerTime } = state.mealTiming;
      const isValid = mealsPerDay >= 1 && mealsPerDay <= 6 && breakfastTime && lunchTime && dinnerTime;
      state.stepValidation[15] = isValid;
      state.errors[15] = isValid ? null : 'Please complete meal timing';
    },

    // Screen 16: Cooking Habits
    setCookingHabits: (state, action) => {
      state.cookingHabits = { ...state.cookingHabits, ...action.payload };
      onboardingSlice.caseReducers.validateStep16(state);
    },

    validateStep16: (state) => {
      const { skillLevel, preferredMethods } = state.cookingHabits;
      const isValid = skillLevel !== '' && preferredMethods.length > 0;
      state.stepValidation[16] = isValid;
      state.errors[16] = isValid ? null : 'Please complete cooking preferences';
    },

    // Screen 17: Medical Conditions
    setMedicalConditions: (state, action) => {
      state.medicalConditions = action.payload;
      state.stepValidation[17] = true; // Optional
      state.errors[17] = null;
    },

    // Screen 18: Supplements
    setSupplements: (state, action) => {
      state.supplements = action.payload;
      state.stepValidation[18] = true; // Optional
      state.errors[18] = null;
    },

    // Screen 19: Notifications
    setNotifications: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
      state.stepValidation[19] = true; // Always valid
      state.errors[19] = null;
    },

    // Screen 20: Summary Confirmation
    confirmSummary: (state) => {
      state.summaryConfirmed = true;
      state.stepValidation[20] = state.termsAccepted;
      state.errors[20] = state.termsAccepted ? null : 'Please accept the terms and privacy policy';
    },

    setTermsAccepted: (state, action) => {
      state.termsAccepted = action.payload;
      state.stepValidation[20] = action.payload;
      state.errors[20] = action.payload ? null : 'Please accept the terms and privacy policy';
    },

    setEditingFromReview: (state, action) => {
      state.editingFromReview = action.payload;
    },

    // Save & Resume
    saveProgress: (state) => {
      state.lastSaved = new Date().toISOString();
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
  acknowledgeWelcome,
  setBasicInfo,
  setPrimaryGoal,
  setTimeline,
  setActivityLevel,
  setExercise,
  setDietaryRestrictions,
  toggleDietaryRestriction,
  setAllergies,
  toggleAllergy,
  setCuisinePreferences,
  toggleCuisinePreference,
  setFavoriteIngredients,
  setDislikedFoods,
  setHousehold,
  setBudget,
  setShoppingPreferences,
  setMealTiming,
  setCookingHabits,
  setMedicalConditions,
  setSupplements,
  setNotifications,
  confirmSummary,
  setTermsAccepted,
  setEditingFromReview,
  saveProgress,
  loadProgress,
  completeOnboarding,
  resetOnboarding
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
