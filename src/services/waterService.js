import { db, isFirebaseFullyInitialized } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
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
import { logError } from '../utils/errorLogger';

/**
 * Water Tracking Service
 * Handles water intake logging and tracking
 */

// Helper to check if Firestore is available
const checkFirestoreConfig = () => {
  if (!isFirebaseFullyInitialized || !db) {
    return createErrorResponse(ERROR_CODES.DB_UNAVAILABLE,
      'Database is not configured. Please check your Firebase setup.');
  }
  return null;
};

/**
 * Log water intake for a specific date
 */
export const logWaterIntake = async (userId, date, glasses) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const waterDocRef = doc(db, 'waterLog', `${userId}_${date}`);

    const waterEntry = {
      userId,
      date,
      glasses: Math.max(0, glasses),
      updatedAt: serverTimestamp()
    };

    await setDoc(waterDocRef, waterEntry, { merge: true });

    return {
      success: true,
      data: waterEntry
    };
  } catch (error) {
    logError('waterService.logWaterIntake', error, { userId, date, glasses });
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get water intake for a specific date
 */
export const getWaterIntake = async (userId, date) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const waterDocRef = doc(db, 'waterLog', `${userId}_${date}`);
    const waterDoc = await getDoc(waterDocRef);

    if (waterDoc.exists()) {
      return {
        success: true,
        data: waterDoc.data()
      };
    } else {
      return {
        success: true,
        data: {
          userId,
          date,
          glasses: 0
        }
      };
    }
  } catch (error) {
    logError('waterService.getWaterIntake', error, { userId, date });
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get water intake history for a date range
 */
export const getWaterHistory = async (userId, startDate, endDate) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const q = query(
      collection(db, 'waterLog'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const history = [];

    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      data: history
    };
  } catch (error) {
    logError('waterService.getWaterHistory', error, { userId, startDate, endDate });
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get weekly water summary
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

    const historyResult = await getWaterHistory(userId, startDate, endDate);

    if (!historyResult.success) {
      return historyResult;
    }

    const history = historyResult.data;
    const totalGlasses = history.reduce((sum, entry) => sum + (entry.glasses || 0), 0);
    const daysTracked = history.length;
    const averagePerDay = daysTracked > 0 ? Math.round(totalGlasses / daysTracked) : 0;

    // Calculate streak
    let currentStreak = 0;
    const sortedDates = history.map(h => h.date).sort().reverse();

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (sortedDates.includes(dateStr)) {
        const entry = history.find(h => h.date === dateStr);
        if (entry && entry.glasses >= 8) {
          currentStreak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return {
      success: true,
      data: {
        totalGlasses,
        daysTracked,
        averagePerDay,
        currentStreak,
        history
      }
    };
  } catch (error) {
    logError('waterService.getWeeklySummary', error, { userId });
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Increment water intake by one glass
 */
export const incrementWater = async (userId, date) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const currentResult = await getWaterIntake(userId, date);
    if (!currentResult.success) {
      return currentResult;
    }

    const currentGlasses = currentResult.data.glasses || 0;
    return await logWaterIntake(userId, date, currentGlasses + 1);
  } catch (error) {
    logError('waterService.incrementWater', error, { userId, date });
    return createErrorResponse(ERROR_CODES.DB_READ_ERROR);
  }
};

/**
 * Decrement water intake by one glass
 */
export const decrementWater = async (userId, date) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const currentResult = await getWaterIntake(userId, date);
    if (!currentResult.success) {
      return currentResult;
    }

    const currentGlasses = currentResult.data.glasses || 0;
    return await logWaterIntake(userId, date, Math.max(0, currentGlasses - 1));
  } catch (error) {
    logError('waterService.decrementWater', error, { userId, date });
    return createErrorResponse(ERROR_CODES.DB_READ_ERROR);
  }
};
