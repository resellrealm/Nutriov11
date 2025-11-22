import { auth, isFirebaseConfigured, firebaseConfigError } from '../config/firebase';
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
  if (configError) return configError;

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
      throw new Error(profileResult.error);
    }

    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        displayName: fullName
      },
      token: await user.getIdToken()
    };
  } catch (error) {
    const errorCode = mapAuthErrorCode(error.code);
    return createErrorResponse(errorCode, error.message);
  }
};

// Login existing user
export const loginUser = async (email, password) => {
  const configError = checkFirebaseConfig();
  if (configError) return configError;

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
        throw new Error('Failed to create user profile');
      }
    } else if (!profileResult.success) {
      throw new Error('Failed to load user profile');
    }

    const profile = profileResult.data;

    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        displayName: user.displayName
      },
      token: await withTimeout(
        user.getIdToken(),
        5000,
        'Failed to get authentication token.'
      ),
      onboardingComplete: profile.onboarding?.completed || false
    };
  } catch (error) {
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
