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
  scanCooldownUntil: null, // Timestamp when cooldown ends
  lastScanTimestamp: null, // Last scan timestamp for cooldown calculation
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
      state.isPremium = false;
      state.dailyScansUsed = 0;
      state.lastScanDate = null;
      state.scanCooldownUntil = null;
      state.lastScanTimestamp = null;
    },
    setOnboardingComplete: (state, action) => {
      state.hasCompletedOnboarding = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setPremiumStatus: (state, action) => {
      state.isPremium = action.payload;
    },
    incrementDailyScans: (state) => {
      const today = new Date().toDateString();
      const now = Date.now();

      // Reset count if new day
      if (state.lastScanDate !== today) {
        state.dailyScansUsed = 1;
        state.lastScanDate = today;
      } else {
        state.dailyScansUsed += 1;
      }

      // Calculate cooldown based on scan count (Premium users only)
      // Basic users: 2 scans/day max (handled in component)
      // Premium users: Progressive cooldown
      if (state.isPremium) {
        let cooldownSeconds = 0;

        if (state.dailyScansUsed >= 26) {
          // 26+ scans: 2 minute cooldown
          cooldownSeconds = 120;
        } else if (state.dailyScansUsed >= 16) {
          // 16-25 scans: 30 second cooldown
          cooldownSeconds = 30;
        }
        // 0-15 scans: No cooldown

        if (cooldownSeconds > 0) {
          state.scanCooldownUntil = now + (cooldownSeconds * 1000);
        } else {
          state.scanCooldownUntil = null;
        }
      }

      state.lastScanTimestamp = now;
    },
    resetDailyScans: (state) => {
      const today = new Date().toDateString();
      if (state.lastScanDate !== today) {
        state.dailyScansUsed = 0;
        state.lastScanDate = today;
        state.scanCooldownUntil = null;
      }
    },
    clearCooldown: (state) => {
      state.scanCooldownUntil = null;
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
  clearCooldown,
} = authSlice.actions;

export default authSlice.reducer;
