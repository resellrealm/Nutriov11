import { db, isFirebaseFullyInitialized } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  ERROR_CODES,
  mapFirestoreErrorCode,
  createErrorResponse
} from '../utils/errorCodes';

/**
 * Exercise Tracking Service
 * Handles logging and tracking exercise activities
 */

// Helper to check if Firestore is available
const checkFirestoreConfig = () => {
  if (!isFirebaseFullyInitialized || !db) {
    return createErrorResponse(ERROR_CODES.DB_UNAVAILABLE,
      'Database is not configured. Please check your Firebase setup.');
  }
  return null;
};

// Exercise types with MET values (Metabolic Equivalent of Task)
// MET value x weight in kg x duration in hours = calories burned
export const EXERCISE_TYPES = {
  // Cardio
  'running': { name: 'Running', met: 9.8, category: 'cardio', icon: '🏃' },
  'jogging': { name: 'Jogging', met: 7.0, category: 'cardio', icon: '🏃' },
  'walking': { name: 'Walking', met: 3.5, category: 'cardio', icon: '🚶' },
  'cycling': { name: 'Cycling', met: 7.5, category: 'cardio', icon: '🚴' },
  'swimming': { name: 'Swimming', met: 8.0, category: 'cardio', icon: '🏊' },
  'hiking': { name: 'Hiking', met: 6.0, category: 'cardio', icon: '🥾' },
  'dancing': { name: 'Dancing', met: 5.0, category: 'cardio', icon: '💃' },
  'jump_rope': { name: 'Jump Rope', met: 12.3, category: 'cardio', icon: '🪢' },

  // Strength Training
  'weight_training': { name: 'Weight Training', met: 6.0, category: 'strength', icon: '🏋️' },
  'bodyweight': { name: 'Bodyweight Exercises', met: 5.0, category: 'strength', icon: '💪' },
  'crossfit': { name: 'CrossFit', met: 8.0, category: 'strength', icon: '⚡' },

  // Sports
  'basketball': { name: 'Basketball', met: 6.5, category: 'sports', icon: '🏀' },
  'soccer': { name: 'Soccer', met: 7.0, category: 'sports', icon: '⚽' },
  'tennis': { name: 'Tennis', met: 7.3, category: 'sports', icon: '🎾' },
  'volleyball': { name: 'Volleyball', met: 4.0, category: 'sports', icon: '🏐' },

  // Flexibility
  'yoga': { name: 'Yoga', met: 2.5, category: 'flexibility', icon: '🧘' },
  'pilates': { name: 'Pilates', met: 3.0, category: 'flexibility', icon: '🤸' },
  'stretching': { name: 'Stretching', met: 2.3, category: 'flexibility', icon: '🤸' },

  // Other
  'other': { name: 'Other', met: 5.0, category: 'other', icon: '🎯' }
};

/**
 * Calculate calories burned
 */
const calculateCaloriesBurned = (exerciseType, durationMinutes, weightKg) => {
  const exercise = EXERCISE_TYPES[exerciseType];
  if (!exercise) return 0;

  const durationHours = durationMinutes / 60;
  return Math.round(exercise.met * weightKg * durationHours);
};

/**
 * Log an exercise
 */
export const logExercise = async (userId, exerciseData, userWeight = 70) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const caloriesBurned = exerciseData.caloriesBurned || calculateCaloriesBurned(
      exerciseData.type,
      exerciseData.duration,
      userWeight
    );

    const exerciseEntry = {
      userId,
      date: exerciseData.date || new Date().toISOString().split('T')[0],
      type: exerciseData.type,
      name: exerciseData.name || EXERCISE_TYPES[exerciseData.type]?.name || 'Exercise',
      duration: exerciseData.duration || 0, // in minutes
      intensity: exerciseData.intensity || 'moderate', // low, moderate, high
      caloriesBurned,
      notes: exerciseData.notes || '',
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'exerciseLog'), exerciseEntry);

    return {
      success: true,
      data: {
        id: docRef.id,
        ...exerciseEntry
      }
    };
  } catch (error) {
    console.error('Error logging exercise:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get exercises for a specific date
 */
export const getExercisesForDate = async (userId, date) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const q = query(
      collection(db, 'exerciseLog'),
      where('userId', '==', userId),
      where('date', '==', date),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const exercises = [];
    let totalDuration = 0;
    let totalCalories = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      exercises.push({
        id: doc.id,
        ...data
      });
      totalDuration += data.duration || 0;
      totalCalories += data.caloriesBurned || 0;
    });

    return {
      success: true,
      data: {
        exercises,
        summary: {
          totalExercises: exercises.length,
          totalDuration,
          totalCalories
        }
      }
    };
  } catch (error) {
    console.error('Error getting exercises:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get exercise history for a date range
 */
export const getExerciseHistory = async (userId, startDate, endDate) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const q = query(
      collection(db, 'exerciseLog'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const exercises = [];
    const dailyTotals = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      exercises.push({
        id: doc.id,
        ...data
      });

      if (!dailyTotals[data.date]) {
        dailyTotals[data.date] = {
          totalExercises: 0,
          totalDuration: 0,
          totalCalories: 0,
          exercises: []
        };
      }

      dailyTotals[data.date].totalExercises++;
      dailyTotals[data.date].totalDuration += data.duration || 0;
      dailyTotals[data.date].totalCalories += data.caloriesBurned || 0;
      dailyTotals[data.date].exercises.push({
        id: doc.id,
        ...data
      });
    });

    return {
      success: true,
      data: {
        exercises,
        dailyTotals,
        totalExercises: exercises.length
      }
    };
  } catch (error) {
    console.error('Error getting exercise history:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Update an exercise
 */
export const updateExercise = async (exerciseId, updates) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const exerciseRef = doc(db, 'exerciseLog', exerciseId);
    await updateDoc(exerciseRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      data: { id: exerciseId, ...updates }
    };
  } catch (error) {
    console.error('Error updating exercise:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Delete an exercise
 */
export const deleteExercise = async (exerciseId) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    await deleteDoc(doc(db, 'exerciseLog', exerciseId));
    return {
      success: true,
      data: { id: exerciseId }
    };
  } catch (error) {
    console.error('Error deleting exercise:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get weekly exercise summary
 */
export const getWeeklySummary = async (userId) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const historyResult = await getExerciseHistory(userId, startDate, endDate);

    if (!historyResult.success) {
      return historyResult;
    }

    const { exercises, dailyTotals } = historyResult.data;

    const totalExercises = exercises.length;
    const totalDuration = exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    const totalCalories = exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
    const daysActive = Object.keys(dailyTotals).length;
    const averageDuration = totalExercises > 0 ? Math.round(totalDuration / totalExercises) : 0;

    // Calculate streak
    let currentStreak = 0;
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (dailyTotals[dateStr] && dailyTotals[dateStr].totalExercises > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      success: true,
      data: {
        totalExercises,
        totalDuration,
        totalCalories,
        daysActive,
        averageDuration,
        currentStreak,
        dailyTotals
      }
    };
  } catch (error) {
    console.error('Error getting weekly summary:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};
