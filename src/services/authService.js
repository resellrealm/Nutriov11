import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { createUserProfile, getUserProfile } from './userService';

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
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
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
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Failed to logout'
    };
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
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get auth error message
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/configuration-not-found':
      return 'Firebase is not configured. Please set up your .env file with valid Firebase credentials';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getCurrentUser,
  getAuthErrorMessage
};
