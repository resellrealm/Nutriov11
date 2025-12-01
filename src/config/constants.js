/**
 * Application Constants
 * Central location for all hardcoded values and magic numbers
 */

// Loading & Timeouts
export const LOADING_TIMEOUT = 6000; // 5 seconds (loading) + 300ms (completion delay) + 700ms (safety buffer)
export const LOADING_SCREEN_INTERVAL = 500; // Progress update interval
export const LOADING_SCREEN_INCREMENT = 10; // Progress increment percentage
export const LOADING_COMPLETION_DELAY = 300; // Delay before completion

// Authentication Timeouts
export const AUTH_TIMEOUT = 15000; // 15 seconds
export const AUTH_INIT_TIMEOUT = 5000; // 5 seconds for auth state check
export const AUTH_RETRY_TIMEOUT = 10000; // 10 seconds for retry operations

// Redux & State Management
export const REDUX_PERSIST_DEBOUNCE = 1000; // 1 second debounce for localStorage saves

// Meal Analyzer
export const MAX_DAILY_SCANS = 2; // Maximum AI scans per day for free users
export const MAX_DAILY_SCANS_PREMIUM = 20; // Maximum AI scans per day for premium users (hidden cap)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB maximum file size

// Nutrition Defaults
export const DEFAULT_CALORIE_TARGET = 2000;
export const DEFAULT_PROTEIN_TARGET = 120; // grams

// Subscription Pricing
export const PREMIUM_PRICE_MONTHLY = '£7.99';
export const PREMIUM_PRICE_ANNUAL = '£79.99';

// API & Network
export const DEFAULT_API_TIMEOUT = 30000; // 30 seconds
export const RETRY_DELAY = 2000; // 2 seconds between retries
export const MAX_RETRY_ATTEMPTS = 3;

// Toast Notifications
export const TOAST_DURATION = 3000; // 3 seconds
export const TOAST_SUCCESS_COLOR = '#7fc7a1';
export const TOAST_ERROR_COLOR = '#ef4444';

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  ONBOARDING_COMPLETE: 'onboardingComplete',
  DARK_MODE: 'darkMode',
  REDUX_STATE: 'reduxState',
};

// Firebase Collection Names
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  FOOD_LOGS: 'foodLogs',
  RECIPES: 'recipes',
  GROCERY_LISTS: 'groceryLists',
  GOALS: 'goals',
  ACHIEVEMENTS: 'achievements',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds maximum allowed size.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a valid image.',
};
