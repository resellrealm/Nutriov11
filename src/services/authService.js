import { auth } from '../config/firebase';
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

// Register new user
export const registerUser = async (email, password, fullName = '') => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name if provided
    if (fullName) {
      await updateProfile(user, { displayName: fullName });
    }

    // Create user profile in Firestore
    const profileResult = await createUserProfile(user.uid, email);

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
    console.error('Registration error:', error);
    const errorCode = mapAuthErrorCode(error.code);
    return createErrorResponse(errorCode);
  }
};

// Login existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const profileResult = await getUserProfile(user.uid);

    if (!profileResult.success) {
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
      token: await user.getIdToken(),
      onboardingComplete: profile.onboarding?.completed || false
    };
  } catch (error) {
    console.error('Login error:', error);
    const errorCode = mapAuthErrorCode(error.code);
    return createErrorResponse(errorCode);
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    const errorCode = mapAuthErrorCode(error.code);
    return createErrorResponse(errorCode);
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent'
    };
  } catch (error) {
    console.error('Password reset error:', error);
    const errorCode = mapAuthErrorCode(error.code);
    return createErrorResponse(errorCode);
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getCurrentUser
};
