import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,
  isPremium: false, // Default to basic plan
  dailyScansUsed: 0,
  lastScanDate: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.hasCompletedOnboarding = false;
      localStorage.clear();
      sessionStorage.clear();
    },
    setOnboardingComplete: (state, action) => {
      state.hasCompletedOnboarding = action.payload;
      if (action.payload) {
        localStorage.setItem('onboardingComplete', 'true');
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setPremiumStatus: (state, action) => {
      state.isPremium = action.payload;
      localStorage.setItem('isPremium', action.payload.toString());
    },
    incrementDailyScans: (state) => {
      const today = new Date().toDateString();
      if (state.lastScanDate !== today) {
        state.dailyScansUsed = 1;
        state.lastScanDate = today;
      } else {
        state.dailyScansUsed += 1;
      }
      localStorage.setItem('dailyScansUsed', state.dailyScansUsed.toString());
      localStorage.setItem('lastScanDate', state.lastScanDate);
    },
    resetDailyScans: (state) => {
      const today = new Date().toDateString();
      if (state.lastScanDate !== today) {
        state.dailyScansUsed = 0;
        state.lastScanDate = today;
        localStorage.setItem('dailyScansUsed', '0');
        localStorage.setItem('lastScanDate', today);
      }
    },
  },
});

export const {
  setCredentials,
  setLoading,
  setError,
  logout,
  setOnboardingComplete,
  updateUser,
  setPremiumStatus,
  incrementDailyScans,
  resetDailyScans,
} = authSlice.actions;

export default authSlice.reducer;
