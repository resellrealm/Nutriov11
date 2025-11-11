import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import onboardingReducer from './onboardingSlice';

// Load persisted onboarding state from localStorage
const loadOnboardingState = () => {
  try {
    const serializedState = localStorage.getItem('onboarding_progress');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Failed to load onboarding state:', err);
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
  },
  preloadedState: {
    onboarding: loadOnboardingState()
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Subscribe to store changes and save onboarding state to localStorage
store.subscribe(() => {
  try {
    const state = store.getState().onboarding;
    localStorage.setItem('onboarding_progress', JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save onboarding state:', err);
  }
});

export default store;
