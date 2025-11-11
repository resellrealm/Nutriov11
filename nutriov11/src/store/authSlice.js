import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,
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
  },
});

export const {
  setCredentials,
  setLoading,
  setError,
  logout,
  setOnboardingComplete,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
