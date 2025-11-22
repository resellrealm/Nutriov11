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

// Helper to check if Firestore is available
const checkFirestoreConfig = () => {
  if (!isFirebaseFullyInitialized || !db) {
    return createErrorResponse(ERROR_CODES.DB_UNAVAILABLE,
      'Database is not configured. Please check your Firebase setup.');
  }
  return null;
};

/**
 * Food Log Service
 * Handles logging food entries from barcode scanning, photo analysis, or manual entry
 */

/**
 * Log a food item
 */
export const logFoodItem = async (userId, foodData) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const foodLogEntry = {
      userId,
      date: foodData.date || new Date().toISOString().split('T')[0],
      mealType: foodData.mealType || 'snack', // breakfast/lunch/dinner/snack

      food: {
        name: foodData.name,
        brand: foodData.brand || '',
        barcode: foodData.barcode || null,
        imageUrl: foodData.imageUrl || '',
        servingSize: {
          amount: foodData.servingSize?.amount || 1,
          unit: foodData.servingSize?.unit || 'serving'
        },
        servingsConsumed: foodData.servingsConsumed || 1,
        nutrition: {
          calories: foodData.nutrition?.calories || 0,
          protein: foodData.nutrition?.protein || 0,
          carbs: foodData.nutrition?.carbs || 0,
          fat: foodData.nutrition?.fat || 0,
          fiber: foodData.nutrition?.fiber || 0,
          sugar: foodData.nutrition?.sugar || 0,
          sodium: foodData.nutrition?.sodium || 0
        }
      },

      source: foodData.source || 'manual', // 'barcode' | 'photo' | 'manual'
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'foodLog'), foodLogEntry);

    return {
      success: true,
      data: {
        id: docRef.id,
        ...foodLogEntry
      }
    };
  } catch (error) {
    console.error('Error logging food item:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get food log for a specific date
 */
export const getFoodLogByDate = async (userId, date) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const q = query(
      collection(db, 'foodLog'),
      where('userId', '==', userId),
      where('date', '==', date),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, data: entries };
  } catch (error) {
    console.error('Error getting food log:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get food log for a date range
 */
export const getFoodLogByDateRange = async (userId, startDate, endDate) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const q = query(
      collection(db, 'foodLog'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, data: entries };
  } catch (error) {
    console.error('Error getting food log by range:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Calculate daily totals for a date
 */
export const getDailyTotals = async (userId, date) => {
  try {
    const result = await getFoodLogByDate(userId, date);

    if (!result.success) {
      return result;
    }

    const entries = result.data;

    const totals = entries.reduce((acc, entry) => {
      const multiplier = entry.food.servingsConsumed || 1;
      const nutrition = entry.food.nutrition || {};

      return {
        calories: acc.calories + (nutrition.calories || 0) * multiplier,
        protein: acc.protein + (nutrition.protein || 0) * multiplier,
        carbs: acc.carbs + (nutrition.carbs || 0) * multiplier,
        fat: acc.fat + (nutrition.fat || 0) * multiplier,
        fiber: acc.fiber + (nutrition.fiber || 0) * multiplier,
        sugar: acc.sugar + (nutrition.sugar || 0) * multiplier,
        sodium: acc.sodium + (nutrition.sodium || 0) * multiplier
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    });

    // Group by meal type
    const byMealType = entries.reduce((acc, entry) => {
      const mealType = entry.mealType || 'snack';
      if (!acc[mealType]) {
        acc[mealType] = { count: 0, calories: 0 };
      }

      const multiplier = entry.food.servingsConsumed || 1;
      acc[mealType].count += 1;
      acc[mealType].calories += (entry.food.nutrition?.calories || 0) * multiplier;

      return acc;
    }, {});

    return {
      success: true,
      data: {
        totals,
        byMealType,
        itemCount: entries.length
      }
    };
  } catch (error) {
    console.error('Error calculating daily totals:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Update a food log entry
 */
export const updateFoodLogEntry = async (entryId, updates) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const entryRef = doc(db, 'foodLog', entryId);
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating food log entry:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Delete a food log entry
 */
export const deleteFoodLogEntry = async (entryId) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    await deleteDoc(doc(db, 'foodLog', entryId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting food log entry:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get weekly summary
 */
export const getWeeklySummary = async (userId) => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];

    const result = await getFoodLogByDateRange(userId, startDateStr, endDateStr);

    if (!result.success) {
      return result;
    }

    const entries = result.data;

    // Group by date
    const byDate = entries.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {});

    // Calculate daily totals
    const dailyTotals = {};
    for (const [date, dateEntries] of Object.entries(byDate)) {
      dailyTotals[date] = dateEntries.reduce((acc, entry) => {
        const multiplier = entry.food.servingsConsumed || 1;
        const nutrition = entry.food.nutrition || {};

        return {
          calories: acc.calories + (nutrition.calories || 0) * multiplier,
          protein: acc.protein + (nutrition.protein || 0) * multiplier,
          carbs: acc.carbs + (nutrition.carbs || 0) * multiplier,
          fat: acc.fat + (nutrition.fat || 0) * multiplier
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }

    return {
      success: true,
      data: {
        byDate,
        dailyTotals,
        totalDays: Object.keys(byDate).length,
        totalEntries: entries.length
      }
    };
  } catch (error) {
    console.error('Error getting weekly summary:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

export default {
  logFoodItem,
  getFoodLogByDate,
  getFoodLogByDateRange,
  getDailyTotals,
  updateFoodLogEntry,
  deleteFoodLogEntry,
  getWeeklySummary
};
