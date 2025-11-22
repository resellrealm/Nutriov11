import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import onboardingReducer from './onboardingSlice';
import nutritionReducer from './nutritionSlice';
import achievementsReducer from './achievementsSlice';

// Load persisted onboarding state from localStorage
const loadOnboardingState = () => {
  try {
    const serializedState = localStorage.getItem('onboarding_progress');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    nutrition: nutritionReducer,
    achievements: achievementsReducer,
  },
  preloadedState: {
    onboarding: loadOnboardingState()
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Debounced localStorage save to avoid excessive writes
let saveTimeout = null;
store.subscribe(() => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const state = store.getState().onboarding;
      localStorage.setItem('onboarding_progress', JSON.stringify(state));
    } catch {
      // Silent fail for localStorage errors
    }
  }, 1000);
});

export default store;
