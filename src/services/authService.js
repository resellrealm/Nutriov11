import { auth, isFirebaseConfigured, firebaseConfigError, isFirebaseFullyInitialized } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { createUserProfile, getUserProfile } from './userService';
import {
  ERROR_CODES,
  mapAuthErrorCode,
  createErrorResponse
} from '../utils/errorCodes';
import { logError } from '../utils/errorLogger';

/**
 * Authentication Service
 * Handles all Firebase Authentication operations
 */

// Helper to check Firebase configuration
const checkFirebaseConfig = () => {
  if (!isFirebaseConfigured || !auth) {
    return createErrorResponse(ERROR_CODES.AUTH_CONFIG_NOT_FOUND,
      firebaseConfigError?.message || 'Firebase is not configured. Please set up your .env file.');
  }
  // Also check if Firestore is initialized (needed for profile operations)
  if (!isFirebaseFullyInitialized) {
    return createErrorResponse(ERROR_CODES.AUTH_CONFIG_NOT_FOUND,
      'Firebase services failed to initialize. Please check your configuration and try again.');
  }
  return null;
};

// Helper to add timeout to promises
const withTimeout = (promise, ms, errorMessage) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), ms)
    )
  ]);
};

// Register new user
export const registerUser = async (email, password, fullName = '') => {
  const configError = checkFirebaseConfig();
  if (configError) {
    return configError;
  }

  try {
    // Create user in Firebase Auth with timeout
    const userCredential = await withTimeout(
      createUserWithEmailAndPassword(auth, email, password),
      15000,
      'Registration timed out. Please check your internet connection.'
    );
    const user = userCredential.user;

    // Update display name if provided
    if (fullName) {
      await withTimeout(
        updateProfile(user, { displayName: fullName }),
        5000,
        'Profile update timed out'
      );
    }

    // Create user profile in Firestore with timeout
    const profileResult = await withTimeout(
      createUserProfile(user.uid, email),
      10000,
      'Database connection timed out. Please try again.'
    );

    if (!profileResult.success) {
      logError('authService.registerUser', 'Profile creation failed', { error: profileResult.error });
      throw new Error(profileResult.error);
    }

    const token = await user.getIdToken();

    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        displayName: fullName
      },
      token: token,
      onboardingComplete: false
    };
  } catch (error) {
    logError('authService.registerUser', error, { code: error.code });
    const errorCode = mapAuthErrorCode(error.code);
    const errorResponse = createErrorResponse(errorCode, error.message);
    return errorResponse;
  }
};

// Login existing user
export const loginUser = async (email, password) => {
  const configError = checkFirebaseConfig();
  if (configError) {
    return configError;
  }

  try {
    // Sign in with timeout
    const userCredential = await withTimeout(
      signInWithEmailAndPassword(auth, email, password),
      15000,
      'Login timed out. Please check your internet connection.'
    );
    const user = userCredential.user;

    // Get user profile from Firestore with timeout
    let profileResult = await withTimeout(
      getUserProfile(user.uid),
      10000,
      'Failed to load profile. Please try again.'
    );

    // If profile doesn't exist (e.g., failed during registration), create it
    if (!profileResult.success && profileResult.errorCode === 'DB_NOT_FOUND') {
      const createResult = await withTimeout(
        createUserProfile(user.uid, user.email),
        10000,
        'Failed to create profile. Please try again.'
      );
      if (createResult.success) {
        profileResult = createResult;
      } else {
        logError('authService.loginUser', 'Failed to create profile', { error: createResult.error });
        throw new Error('Failed to create user profile');
      }
    } else if (!profileResult.success) {
      logError('authService.loginUser', 'Failed to load profile', { error: profileResult.error });
      throw new Error('Failed to load user profile');
    }

    const profile = profileResult.data;

    const token = await withTimeout(
      user.getIdToken(),
      5000,
      'Failed to get authentication token.'
    );

    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        displayName: user.displayName
      },
      token: token,
      onboardingComplete: profile.onboarding?.completed || false,
      isPremium: profile.subscription?.status === 'premium' || false,
      planTier: profile.subscription?.planTier || 'free'
    };
  } catch (error) {
    logError('authService.loginUser', error, { code: error.code });

    // Handle network-specific errors
    if (error.message && error.message.includes('timed out')) {
      return createErrorResponse(ERROR_CODES.AUTH_NETWORK_FAILED, error.message);
    }
    if (error.code === 'auth/network-request-failed') {
      return createErrorResponse(ERROR_CODES.AUTH_NETWORK_FAILED,
        'Network connection failed. Please check your internet connection and try again.');
    }
    const errorCode = mapAuthErrorCode(error.code);
    return createErrorResponse(errorCode, error.message);
  }
};

// Logout user
export const logoutUser = async () => {
  const configError = checkFirebaseConfig();
  if (configError) return configError;

  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    const errorCode = mapAuthErrorCode(error.code);
    return createErrorResponse(errorCode);
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  const configError = checkFirebaseConfig();
  if (configError) return configError;

  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent'
    };
  } catch (error) {
    const errorCode = mapAuthErrorCode(error.code);
    return createErrorResponse(errorCode);
  }
};

// Get current user
export const getCurrentUser = () => {
  if (!isFirebaseConfigured || !auth) return null;
  return auth.currentUser;
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getCurrentUser
};
