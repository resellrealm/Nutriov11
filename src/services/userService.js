import { db, storage, isFirebaseFullyInitialized } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  ERROR_CODES,
  mapFirestoreErrorCode,
  createErrorResponse
} from '../utils/errorCodes';

// Helper to check if Firestore is available
const checkFirestoreConfig = () => {
  if (!isFirebaseFullyInitialized || !db) {
    return createErrorResponse(ERROR_CODES.DB_UNAVAILABLE,
      'Database is not configured. Please check your Firebase setup.');
  }
  return null;
};

/**
 * User Service
 * Handles all user profile operations in Firestore
 */

// Create a new user profile after registration
export const createUserProfile = async (userId, email) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const userRef = doc(db, 'users', userId);
    const userData = {
      id: userId,
      email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),

      onboarding: {
        started: false,
        startedAt: null,
        completed: false,
        completedAt: null,
        currentScreen: 1
      },

      basicInfo: {
        fullName: '',
        dateOfBirth: null,
        age: null,
        gender: '',
        height: { value: null, unit: 'cm' },
        currentWeight: { value: null, unit: 'kg' },
        targetWeight: { value: null, unit: 'kg' }
      },

      goals: {
        primary: '',
        timeline: '',
        activityLevel: ''
      },

      exercise: {
        types: [],
        avgDuration: 0,
        frequency: 0
      },

      dietary: {
        restrictions: [],
        allergies: [],
        cuisinePreferences: [],
        favoriteIngredients: {
          proteins: [],
          vegetables: [],
          fruits: [],
          grains: [],
          snacks: []
        },
        dislikedFoods: []
      },

      household: {
        totalMembers: 1,
        hasChildren: false,
        childrenCount: 0,
        childrenAges: [],
        feedingOthers: [],
        adultCount: 1
      },

      budget: {
        weekly: 0,
        currency: 'USD',
        priority: 'flexible',
        perPerson: 0
      },

      shoppingPreferences: {
        preferredStores: [],
        frequency: '',
        organic: 'when_affordable',
        bulkBuying: false
      },

      mealTiming: {
        mealsPerDay: 3,
        snacksPerDay: 2,
        breakfastTime: '08:00',
        lunchTime: '13:00',
        dinnerTime: '19:00',
        mealPreps: '',
        intermittentFasting: false,
        fastingWindow: ''
      },

      cookingHabits: {
        skillLevel: '',
        timeAvailable: { breakfast: 15, lunch: 30, dinner: 45 },
        preferredMethods: [],
        kitchenEquipment: []
      },

      health: {
        medicalConditions: [],
        supplements: []
      },

      notifications: {
        mealReminders: { enabled: false, times: [] },
        waterReminders: { enabled: false, frequency: '' },
        groceryReminders: { enabled: false, dayOfWeek: '' },
        progressCheckIns: { enabled: false, frequency: '' },
        recipeSuggestions: false,
        achievements: false
      },

      calculated: {
        bmi: 0,
        tdee: 0,
        recommendedCalories: 0,
        macros: { protein: 0, carbs: 0, fat: 0 }
      }
    };

    await setDoc(userRef, userData);
    return { success: true, data: userData };
  } catch (error) {
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return createErrorResponse(ERROR_CODES.DB_NOT_FOUND, 'User profile not found');
    }
  } catch (error) {
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

// Update user profile (partial update)
export const updateUserProfile = async (userId, updates) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      lastLogin: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

// Update onboarding progress
export const updateOnboardingProgress = async (userId, screenNumber, data) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const userRef = doc(db, 'users', userId);
    const updates = {
      ...data,
      'onboarding.currentScreen': screenNumber,
      'onboarding.started': true,
      'onboarding.startedAt': serverTimestamp()
    };

    await updateDoc(userRef, updates);
    return { success: true };
  } catch (error) {
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

// Complete onboarding
export const completeOnboarding = async (userId, calculatedMetrics) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'onboarding.completed': true,
      'onboarding.completedAt': serverTimestamp(),
      'calculated': calculatedMetrics
    });
    return { success: true };
  } catch (error) {
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

// Calculate BMI
export const calculateBMI = (weight, height, weightUnit, heightUnit) => {
  // Convert to metric
  let weightKg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
  let heightM = heightUnit === 'ft' ? height * 0.3048 : height / 100;

  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
};

// Calculate TDEE (Total Daily Energy Expenditure)
export const calculateTDEE = (weight, height, age, gender, activityLevel, weightUnit, heightUnit) => {
  // Convert to metric
  let weightKg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
  let heightCm = heightUnit === 'ft' ? height * 30.48 : height;

  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    'sedentary': 1.2,
    'lightly_active': 1.375,
    'moderately_active': 1.55,
    'very_active': 1.725,
    'extremely_active': 1.9
  };

  const multiplier = activityMultipliers[activityLevel] || 1.2;
  const tdee = bmr * multiplier;

  return Math.round(tdee);
};

// Calculate recommended macros
export const calculateMacros = (tdee, goal) => {
  let proteinPercent, carbsPercent, fatPercent;

  switch (goal) {
    case 'lose_weight':
      proteinPercent = 0.35;
      carbsPercent = 0.35;
      fatPercent = 0.30;
      break;
    case 'gain_muscle':
      proteinPercent = 0.30;
      carbsPercent = 0.45;
      fatPercent = 0.25;
      break;
    case 'maintain':
      proteinPercent = 0.30;
      carbsPercent = 0.40;
      fatPercent = 0.30;
      break;
    default:
      proteinPercent = 0.30;
      carbsPercent = 0.40;
      fatPercent = 0.30;
  }

  return {
    protein: Math.round((tdee * proteinPercent) / 4), // 4 cal per gram
    carbs: Math.round((tdee * carbsPercent) / 4),
    fat: Math.round((tdee * fatPercent) / 9) // 9 cal per gram
  };
};

// Calculate all metrics at once
export const calculateAllMetrics = (userProfile) => {
  const { basicInfo, goals, exercise: _exercise } = userProfile || {};

  // Default values for safety
  const weight = basicInfo?.currentWeight?.value || 70;
  const height = basicInfo?.height?.value || 170;
  const weightUnit = basicInfo?.currentWeight?.unit || 'kg';
  const heightUnit = basicInfo?.height?.unit || 'cm';
  const age = basicInfo?.age || 30;
  const gender = basicInfo?.gender || 'male';
  const activityLevel = goals?.activityLevel || 'moderately_active';
  const primaryGoal = goals?.primary || 'maintain';

  const bmi = calculateBMI(weight, height, weightUnit, heightUnit);

  const tdee = calculateTDEE(
    weight,
    height,
    age,
    gender,
    activityLevel,
    weightUnit,
    heightUnit
  );

  // Adjust TDEE based on goal
  let recommendedCalories = tdee;
  if (primaryGoal === 'lose_weight') {
    recommendedCalories = Math.round(tdee * 0.85); // 15% deficit
  } else if (primaryGoal === 'gain_muscle') {
    recommendedCalories = Math.round(tdee * 1.1); // 10% surplus
  }

  const macros = calculateMacros(recommendedCalories, primaryGoal);

  return {
    bmi,
    tdee,
    recommendedCalories,
    macros
  };
};

/**
 * Upload profile photo to Firebase Storage
 * @param {string} userId - User ID
 * @param {File} photoFile - Image file to upload
 * @returns {Promise<Object>} Result with photo URL
 */
export const uploadProfilePhoto = async (userId, photoFile) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  if (!storage) {
    return createErrorResponse(ERROR_CODES.DB_UNAVAILABLE,
      'Storage is not configured. Please check your Firebase setup.');
  }

  try {
    // Validate file
    if (!photoFile) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(photoFile.type)) {
      return { success: false, error: 'Invalid file type. Please upload a JPG, PNG, or WebP image.' };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (photoFile.size > maxSize) {
      return { success: false, error: 'File too large. Maximum size is 5MB.' };
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileExt = photoFile.name.split('.').pop();
    const filename = `profile_${timestamp}.${fileExt}`;
    const storageRef = ref(storage, `users/${userId}/profile/${filename}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, photoFile);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update user profile with photo URL
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: downloadURL,
      photoPath: snapshot.ref.fullPath,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      data: {
        url: downloadURL,
        path: snapshot.ref.fullPath
      }
    };
  } catch (error) {
    const errorCode = mapFirestoreErrorCode(error.code);
    return createErrorResponse(errorCode,
      `Failed to upload profile photo: ${error.message}`,
      error);
  }
};

/**
 * Delete profile photo from Firebase Storage
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result
 */
export const deleteProfilePhoto = async (userId) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  if (!storage) {
    return createErrorResponse(ERROR_CODES.DB_UNAVAILABLE,
      'Storage is not configured. Please check your Firebase setup.');
  }

  try {
    // Get user profile to find photo path
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'User profile not found' };
    }

    const userData = userSnap.data();
    const photoPath = userData.photoPath;

    if (!photoPath) {
      return { success: false, error: 'No profile photo to delete' };
    }

    // Delete from storage
    const photoRef = ref(storage, photoPath);
    await deleteObject(photoRef);

    // Update user profile
    await updateDoc(userRef, {
      photoURL: null,
      photoPath: null,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Profile photo deleted successfully'
    };
  } catch (error) {
    // If file doesn't exist in storage, still update the profile
    if (error.code === 'storage/object-not-found') {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        photoURL: null,
        photoPath: null,
        updatedAt: serverTimestamp()
      });
      return {
        success: true,
        message: 'Profile photo reference removed'
      };
    }

    const errorCode = mapFirestoreErrorCode(error.code);
    return createErrorResponse(errorCode,
      `Failed to delete profile photo: ${error.message}`,
      error);
  }
};

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateOnboardingProgress,
  completeOnboarding,
  uploadProfilePhoto,
  deleteProfilePhoto,
  calculateBMI,
  calculateTDEE,
  calculateMacros,
  calculateAllMetrics
};
