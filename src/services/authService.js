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
  console.log('🔥 [AUTH SERVICE] registerUser called');
  console.log('🔥 [AUTH SERVICE] Email:', email);
  console.log('🔥 [AUTH SERVICE] Full name:', fullName);

  const configError = checkFirebaseConfig();
  if (configError) {
    console.error('🔥 [AUTH SERVICE] Firebase config error:', configError);
    return configError;
  }

  console.log('🔥 [AUTH SERVICE] Firebase config OK');

  try {
    // Create user in Firebase Auth with timeout
    console.log('🔥 [AUTH SERVICE] Creating user in Firebase Auth...');
    const userCredential = await withTimeout(
      createUserWithEmailAndPassword(auth, email, password),
      15000,
      'Registration timed out. Please check your internet connection.'
    );
    const user = userCredential.user;
    console.log('🔥 [AUTH SERVICE] User created successfully:', user.uid);

    // Update display name if provided
    if (fullName) {
      console.log('🔥 [AUTH SERVICE] Updating display name...');
      await withTimeout(
        updateProfile(user, { displayName: fullName }),
        5000,
        'Profile update timed out'
      );
      console.log('🔥 [AUTH SERVICE] Display name updated');
    }

    // Create user profile in Firestore with timeout
    console.log('🔥 [AUTH SERVICE] Creating user profile in Firestore...');
    const profileResult = await withTimeout(
      createUserProfile(user.uid, email),
      10000,
      'Database connection timed out. Please try again.'
    );

    if (!profileResult.success) {
      console.error('🔥 [AUTH SERVICE] Profile creation failed:', profileResult.error);
      throw new Error(profileResult.error);
    }

    console.log('🔥 [AUTH SERVICE] Profile created successfully');
    console.log('🔥 [AUTH SERVICE] Getting auth token...');
    const token = await user.getIdToken();
    console.log('🔥 [AUTH SERVICE] Token obtained');

    const successResult = {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        displayName: fullName
      },
      token: token,
      onboardingComplete: false
    };

    console.log('🔥 [AUTH SERVICE] Registration successful!', successResult);
    return successResult;
  } catch (error) {
    console.error('🔥 [AUTH SERVICE] Registration error:', error);
    console.error('🔥 [AUTH SERVICE] Error code:', error.code);
    console.error('🔥 [AUTH SERVICE] Error message:', error.message);
    const errorCode = mapAuthErrorCode(error.code);
    const errorResponse = createErrorResponse(errorCode, error.message);
    console.error('🔥 [AUTH SERVICE] Error response:', errorResponse);
    return errorResponse;
  }
};

// Login existing user
export const loginUser = async (email, password) => {
  console.log('🔥 [AUTH SERVICE] loginUser called');
  console.log('🔥 [AUTH SERVICE] Email:', email);

  const configError = checkFirebaseConfig();
  if (configError) {
    console.error('🔥 [AUTH SERVICE] Firebase config error:', configError);
    return configError;
  }

  console.log('🔥 [AUTH SERVICE] Firebase config OK');

  try {
    // Sign in with timeout
    console.log('🔥 [AUTH SERVICE] Signing in to Firebase Auth...');
    const userCredential = await withTimeout(
      signInWithEmailAndPassword(auth, email, password),
      15000,
      'Login timed out. Please check your internet connection.'
    );
    const user = userCredential.user;
    console.log('🔥 [AUTH SERVICE] Sign in successful:', user.uid);

    // Get user profile from Firestore with timeout
    console.log('🔥 [AUTH SERVICE] Getting user profile from Firestore...');
    let profileResult = await withTimeout(
      getUserProfile(user.uid),
      10000,
      'Failed to load profile. Please try again.'
    );

    // If profile doesn't exist (e.g., failed during registration), create it
    if (!profileResult.success && profileResult.errorCode === 'DB_NOT_FOUND') {
      console.log('🔥 [AUTH SERVICE] Profile not found, creating new profile...');
      const createResult = await withTimeout(
        createUserProfile(user.uid, user.email),
        10000,
        'Failed to create profile. Please try again.'
      );
      if (createResult.success) {
        profileResult = createResult;
        console.log('🔥 [AUTH SERVICE] Profile created successfully');
      } else {
        console.error('🔥 [AUTH SERVICE] Failed to create profile:', createResult.error);
        throw new Error('Failed to create user profile');
      }
    } else if (!profileResult.success) {
      console.error('🔥 [AUTH SERVICE] Failed to load profile:', profileResult.error);
      throw new Error('Failed to load user profile');
    }

    console.log('🔥 [AUTH SERVICE] Profile loaded successfully');
    const profile = profileResult.data;

    console.log('🔥 [AUTH SERVICE] Getting auth token...');
    const token = await withTimeout(
      user.getIdToken(),
      5000,
      'Failed to get authentication token.'
    );
    console.log('🔥 [AUTH SERVICE] Token obtained');

    const successResult = {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        displayName: user.displayName
      },
      token: token,
      onboardingComplete: profile.onboarding?.completed || false
    };

    console.log('🔥 [AUTH SERVICE] Login successful!', successResult);
    return successResult;
  } catch (error) {
    console.error('🔥 [AUTH SERVICE] Login error:', error);
    console.error('🔥 [AUTH SERVICE] Error code:', error.code);
    console.error('🔥 [AUTH SERVICE] Error message:', error.message);

    // Handle network-specific errors
    if (error.message && error.message.includes('timed out')) {
      const errorResponse = createErrorResponse(ERROR_CODES.AUTH_NETWORK_FAILED, error.message);
      console.error('🔥 [AUTH SERVICE] Timeout error response:', errorResponse);
      return errorResponse;
    }
    if (error.code === 'auth/network-request-failed') {
      const errorResponse = createErrorResponse(ERROR_CODES.AUTH_NETWORK_FAILED,
        'Network connection failed. Please check your internet connection and try again.');
      console.error('🔥 [AUTH SERVICE] Network error response:', errorResponse);
      return errorResponse;
    }
    const errorCode = mapAuthErrorCode(error.code);
    const errorResponse = createErrorResponse(errorCode, error.message);
    console.error('🔥 [AUTH SERVICE] Error response:', errorResponse);
    return errorResponse;
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
