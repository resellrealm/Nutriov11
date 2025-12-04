import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logError } from '../utils/errorLogger';

/**
 * Goals Service - Manages user nutrition goals and targets
 */

/**
 * Get user's nutrition goals
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with goals data
 */
export const getUserGoals = async (userId) => {
  try {
    const goalsRef = doc(db, 'users', userId, 'nutrition', 'goals');
    const goalsSnap = await getDoc(goalsRef);

    if (goalsSnap.exists()) {
      return {
        success: true,
        data: goalsSnap.data()
      };
    } else {
      // Return default goals structure
      return {
        success: true,
        data: null
      };
    }
  } catch (error) {
    logError('goalsService.getUserGoals', error, { userId });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Save or update user's nutrition goals
 * @param {string} userId - User ID
 * @param {Object} goals - Goals data
 * @returns {Promise<Object>} Result
 */
export const saveUserGoals = async (userId, goals) => {
  try {
    const goalsRef = doc(db, 'users', userId, 'nutrition', 'goals');

    const goalsData = {
      ...goals,
      updatedAt: serverTimestamp()
    };

    // Check if document exists
    const goalsSnap = await getDoc(goalsRef);

    if (goalsSnap.exists()) {
      await updateDoc(goalsRef, goalsData);
    } else {
      await setDoc(goalsRef, {
        ...goalsData,
        createdAt: serverTimestamp()
      });
    }

    return {
      success: true,
      message: 'Goals saved successfully'
    };
  } catch (error) {
    logError('goalsService.saveUserGoals', error, { userId, goals });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Calculate default goals based on user profile
 * @param {Object} userProfile - User profile data
 * @returns {Object} Calculated default goals
 */
export const calculateDefaultGoals = (userProfile) => {
  const recommendedCalories = userProfile.calculated?.recommendedCalories || 2000;
  const macros = userProfile.calculated?.macros || { protein: 30, carbs: 45, fat: 25 };

  // Calculate macro grams from percentages
  const proteinGrams = Math.round((recommendedCalories * (macros.protein / 100)) / 4); // 4 cal/g
  const carbsGrams = Math.round((recommendedCalories * (macros.carbs / 100)) / 4); // 4 cal/g
  const fatGrams = Math.round((recommendedCalories * (macros.fat / 100)) / 9); // 9 cal/g

  return {
    calories: recommendedCalories,
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
    fiber: 25, // Default fiber goal (g)
    water: 8, // Default water goal (glasses)
    sodium: 2300, // Default sodium limit (mg)
    sugar: 50, // Default sugar limit (g)
    customGoals: []
  };
};

/**
 * Calculate progress towards goals for a specific day
 * @param {Object} dailyTotals - Daily nutrition totals
 * @param {Object} goals - User goals
 * @returns {Object} Progress data with percentages
 */
export const calculateGoalProgress = (dailyTotals, goals) => {
  if (!dailyTotals || !goals) {
    return null;
  }

  const calculatePercentage = (actual, target) => {
    if (!target || target === 0) return 0;
    return Math.round((actual / target) * 100);
  };

  const getStatus = (percentage, isLimit = false) => {
    if (isLimit) {
      // For limits like sodium/sugar, lower is better
      if (percentage <= 75) return 'good';
      if (percentage <= 100) return 'warning';
      return 'over';
    } else {
      // For goals like protein/calories
      if (percentage >= 90 && percentage <= 110) return 'good';
      if (percentage >= 80 && percentage < 90) return 'close';
      if (percentage < 80) return 'under';
      return 'over';
    }
  };

  const totals = dailyTotals.totals || dailyTotals;

  return {
    calories: {
      actual: Math.round(totals.calories || 0),
      target: goals.calories,
      percentage: calculatePercentage(totals.calories, goals.calories),
      status: getStatus(calculatePercentage(totals.calories, goals.calories))
    },
    protein: {
      actual: Math.round(totals.protein || 0),
      target: goals.protein,
      percentage: calculatePercentage(totals.protein, goals.protein),
      status: getStatus(calculatePercentage(totals.protein, goals.protein))
    },
    carbs: {
      actual: Math.round(totals.carbs || 0),
      target: goals.carbs,
      percentage: calculatePercentage(totals.carbs, goals.carbs),
      status: getStatus(calculatePercentage(totals.carbs, goals.carbs))
    },
    fat: {
      actual: Math.round(totals.fat || 0),
      target: goals.fat,
      percentage: calculatePercentage(totals.fat, goals.fat),
      status: getStatus(calculatePercentage(totals.fat, goals.fat))
    },
    fiber: {
      actual: Math.round(totals.fiber || 0),
      target: goals.fiber || 25,
      percentage: calculatePercentage(totals.fiber, goals.fiber || 25),
      status: getStatus(calculatePercentage(totals.fiber, goals.fiber || 25))
    },
    water: goals.water ? {
      actual: totals.water || 0,
      target: goals.water,
      percentage: calculatePercentage(totals.water, goals.water),
      status: getStatus(calculatePercentage(totals.water, goals.water))
    } : null,
    sodium: goals.sodium ? {
      actual: Math.round(totals.sodium || 0),
      target: goals.sodium,
      percentage: calculatePercentage(totals.sodium, goals.sodium),
      status: getStatus(calculatePercentage(totals.sodium, goals.sodium), true)
    } : null,
    sugar: goals.sugar ? {
      actual: Math.round(totals.sugar || 0),
      target: goals.sugar,
      percentage: calculatePercentage(totals.sugar, goals.sugar),
      status: getStatus(calculatePercentage(totals.sugar, goals.sugar), true)
    } : null
  };
};

/**
 * Get weekly goal adherence statistics
 * @param {Object} weeklyData - Weekly summary data
 * @param {Object} goals - User goals
 * @returns {Object} Weekly adherence stats
 */
export const getWeeklyGoalAdherence = (weeklyData, goals) => {
  if (!weeklyData || !weeklyData.dailyTotals || !goals) {
    return null;
  }

  const dailyTotalsArray = Object.entries(weeklyData.dailyTotals);
  const daysWithData = dailyTotalsArray.length;

  if (daysWithData === 0) {
    return null;
  }

  let daysMetCalories = 0;
  let daysMetProtein = 0;
  let daysMetCarbs = 0;
  let daysMetFat = 0;
  let daysMetAllMacros = 0;

  dailyTotalsArray.forEach(([_, dayData]) => {
    const caloriePercent = (dayData.calories / goals.calories) * 100;
    const proteinPercent = (dayData.protein / goals.protein) * 100;
    const carbsPercent = (dayData.carbs / goals.carbs) * 100;
    const fatPercent = (dayData.fat / goals.fat) * 100;

    if (caloriePercent >= 90 && caloriePercent <= 110) daysMetCalories++;
    if (proteinPercent >= 90 && proteinPercent <= 110) daysMetProtein++;
    if (carbsPercent >= 90 && carbsPercent <= 110) daysMetCarbs++;
    if (fatPercent >= 90 && fatPercent <= 110) daysMetFat++;

    if (
      caloriePercent >= 90 && caloriePercent <= 110 &&
      proteinPercent >= 90 && proteinPercent <= 110 &&
      carbsPercent >= 90 && carbsPercent <= 110 &&
      fatPercent >= 90 && fatPercent <= 110
    ) {
      daysMetAllMacros++;
    }
  });

  return {
    daysTracked: daysWithData,
    adherence: {
      calories: {
        daysMet: daysMetCalories,
        percentage: Math.round((daysMetCalories / daysWithData) * 100)
      },
      protein: {
        daysMet: daysMetProtein,
        percentage: Math.round((daysMetProtein / daysWithData) * 100)
      },
      carbs: {
        daysMet: daysMetCarbs,
        percentage: Math.round((daysMetCarbs / daysWithData) * 100)
      },
      fat: {
        daysMet: daysMetFat,
        percentage: Math.round((daysMetFat / daysWithData) * 100)
      },
      allMacros: {
        daysMet: daysMetAllMacros,
        percentage: Math.round((daysMetAllMacros / daysWithData) * 100)
      }
    }
  };
};
