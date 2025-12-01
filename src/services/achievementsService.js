import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Achievements Service - Manages user achievements and gamification
 */

// Achievement Definitions
export const ACHIEVEMENT_DEFINITIONS = [
  // Easy Achievements (15)
  {
    id: 'first_meal',
    name: 'First Steps',
    description: 'Log your first meal',
    difficulty: 'easy',
    checkFunction: (stats) => stats.totalMealsLogged >= 1
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log breakfast 3 days in a row',
    difficulty: 'easy',
    checkFunction: (stats) => stats.breakfastStreak >= 3
  },
  {
    id: 'water_warrior',
    name: 'Water Warrior',
    description: 'Drink 8 glasses of water in a day',
    difficulty: 'easy',
    checkFunction: (stats) => stats.maxWaterInDay >= 8
  },
  {
    id: 'veggie_lover',
    name: 'Veggie Lover',
    description: 'Log 5 meals with vegetables',
    difficulty: 'easy',
    checkFunction: (stats) => stats.mealsWithVeggies >= 5
  },
  {
    id: 'protein_power',
    name: 'Protein Power',
    description: 'Meet protein goal for 3 days',
    difficulty: 'easy',
    checkFunction: (stats) => stats.daysMetProtein >= 3
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Maintain a 3-day logging streak',
    difficulty: 'easy',
    checkFunction: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'calorie_conscious',
    name: 'Calorie Conscious',
    description: 'Stay within calorie goal for 5 days',
    difficulty: 'easy',
    checkFunction: (stats) => stats.daysMetCalories >= 5
  },
  {
    id: 'balanced_breakfast',
    name: 'Balanced Breakfast',
    description: 'Log 10 balanced breakfasts',
    difficulty: 'easy',
    checkFunction: (stats) => stats.balancedBreakfasts >= 10
  },
  {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Complete a full week of logging',
    difficulty: 'easy',
    checkFunction: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'macro_beginner',
    name: 'Macro Beginner',
    description: 'Track macros for 5 days',
    difficulty: 'easy',
    checkFunction: (stats) => stats.daysTracked >= 5
  },

  // Medium Achievements (10)
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Log meals for 30 days straight',
    difficulty: 'medium',
    checkFunction: (stats) => stats.currentStreak >= 30
  },
  {
    id: 'macro_master',
    name: 'Macro Master',
    description: 'Hit all macro goals for 7 days',
    difficulty: 'medium',
    checkFunction: (stats) => stats.daysMetAllMacros >= 7
  },
  {
    id: 'healthy_habits',
    name: 'Healthy Habits',
    description: 'Log 100 meals',
    difficulty: 'medium',
    checkFunction: (stats) => stats.totalMealsLogged >= 100
  },
  {
    id: 'calorie_champion',
    name: 'Calorie Champion',
    description: 'Stay within 50 calories of goal for 14 days',
    difficulty: 'medium',
    checkFunction: (stats) => stats.daysWithinCalorieRange >= 14
  },
  {
    id: 'protein_pro',
    name: 'Protein Pro',
    description: 'Meet protein goal for 30 days',
    difficulty: 'medium',
    checkFunction: (stats) => stats.daysMetProtein >= 30
  },
  {
    id: 'balanced_diet',
    name: 'Balanced Diet',
    description: 'Achieve balanced macros for 21 days',
    difficulty: 'medium',
    checkFunction: (stats) => stats.daysMetAllMacros >= 21
  },
  {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    description: 'Meet water goal for 30 days',
    difficulty: 'medium',
    checkFunction: (stats) => stats.daysMetWater >= 30
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 60-day streak',
    difficulty: 'medium',
    checkFunction: (stats) => stats.currentStreak >= 60
  },

  // Hard Achievements (10)
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Log meals for 100 consecutive days',
    difficulty: 'hard',
    checkFunction: (stats) => stats.currentStreak >= 100
  },
  {
    id: 'nutrition_perfectionist',
    name: 'Nutrition Perfectionist',
    description: 'Hit all goals for 30 days straight',
    difficulty: 'hard',
    checkFunction: (stats) => stats.daysMetAllMacros >= 30
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Maintain a 180-day logging streak',
    difficulty: 'hard',
    checkFunction: (stats) => stats.currentStreak >= 180
  },
  {
    id: 'macro_genius',
    name: 'Macro Genius',
    description: 'Perfect macro balance for 60 days',
    difficulty: 'hard',
    checkFunction: (stats) => stats.daysMetAllMacros >= 60
  },
  {
    id: 'meal_master',
    name: 'Meal Master',
    description: 'Log 500 meals',
    difficulty: 'hard',
    checkFunction: (stats) => stats.totalMealsLogged >= 500
  },
  {
    id: 'legendary',
    name: 'Legendary',
    description: 'Maintain a 365-day streak',
    difficulty: 'hard',
    checkFunction: (stats) => stats.currentStreak >= 365
  }
];

/**
 * Get user's achievement data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Achievement data
 */
export const getUserAchievements = async (userId) => {
  try {
    const achievementsRef = doc(db, 'users', userId, 'gamification', 'achievements');
    const achievementsSnap = await getDoc(achievementsRef);

    if (achievementsSnap.exists()) {
      return {
        success: true,
        data: achievementsSnap.data()
      };
    } else {
      // Return initial empty achievements
      return {
        success: true,
        data: {
          unlocked: [],
          progress: {},
          stats: {},
          lastUpdated: null
        }
      };
    }
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Calculate achievement statistics from user data
 * @param {Object} foodLogData - All food log data
 * @param {Object} goals - User goals
 * @returns {Object} Calculated stats
 */
export const calculateAchievementStats = (foodLogData, goals) => {
  const stats = {
    totalMealsLogged: 0,
    currentStreak: 0,
    longestStreak: 0,
    daysTracked: 0,
    daysMetCalories: 0,
    daysMetProtein: 0,
    daysMetCarbs: 0,
    daysMetFat: 0,
    daysMetAllMacros: 0,
    daysWithinCalorieRange: 0,
    daysMetWater: 0,
    breakfastStreak: 0,
    maxWaterInDay: 0,
    mealsWithVeggies: 0,
    balancedBreakfasts: 0
  };

  if (!foodLogData || !foodLogData.byDate) {
    return stats;
  }

  const sortedDates = Object.keys(foodLogData.byDate).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let breakfastStreak = 0;
  let lastDate = null;

  sortedDates.forEach(dateStr => {
    const dayEntries = foodLogData.byDate[dateStr];
    const dayData = foodLogData.dailyTotals?.[dateStr] || {};

    // Count total meals
    stats.totalMealsLogged += dayEntries.length;
    stats.daysTracked++;

    // Calculate streak
    if (lastDate) {
      const dayDiff = Math.floor((new Date(dateStr) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Check if today is included in streak
    const today = new Date().toISOString().split('T')[0];
    const lastDateObj = new Date(sortedDates[sortedDates.length - 1]);
    const todayObj = new Date(today);
    const daysSinceLastLog = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));

    if (daysSinceLastLog <= 1) {
      stats.currentStreak = currentStreak;
    }

    stats.longestStreak = longestStreak;

    // Breakfast streak
    const hasBreakfast = dayEntries.some(entry => entry.mealType === 'breakfast');
    if (hasBreakfast) {
      if (lastDate) {
        const dayDiff = Math.floor((new Date(dateStr) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          breakfastStreak++;
        } else {
          breakfastStreak = 1;
        }
      } else {
        breakfastStreak = 1;
      }
      if (breakfastStreak > stats.breakfastStreak) {
        stats.breakfastStreak = breakfastStreak;
      }
    } else {
      breakfastStreak = 0;
    }

    // Count balanced breakfasts (has protein, carbs, and not too high in calories)
    const breakfastEntries = dayEntries.filter(e => e.mealType === 'breakfast');
    breakfastEntries.forEach(breakfast => {
      const nutrients = breakfast.nutrients || {};
      if (nutrients.protein >= 15 && nutrients.carbs >= 20 && nutrients.calories <= 500) {
        stats.balancedBreakfasts++;
      }
    });

    // Meals with veggies (heuristic: fiber > 3g per meal)
    dayEntries.forEach(entry => {
      const fiber = entry.nutrients?.fiber || 0;
      if (fiber >= 3) {
        stats.mealsWithVeggies++;
      }
    });

    // Water tracking
    if (dayData.water && dayData.water > stats.maxWaterInDay) {
      stats.maxWaterInDay = dayData.water;
    }
    if (goals?.water && dayData.water >= goals.water) {
      stats.daysMetWater++;
    }

    // Goal adherence
    if (goals) {
      const caloriePercent = (dayData.calories / goals.calories) * 100;
      const proteinPercent = (dayData.protein / goals.protein) * 100;
      const carbsPercent = (dayData.carbs / goals.carbs) * 100;
      const fatPercent = (dayData.fat / goals.fat) * 100;

      if (caloriePercent >= 90 && caloriePercent <= 110) {
        stats.daysMetCalories++;
      }
      if (Math.abs(dayData.calories - goals.calories) <= 50) {
        stats.daysWithinCalorieRange++;
      }
      if (proteinPercent >= 90 && proteinPercent <= 110) {
        stats.daysMetProtein++;
      }
      if (carbsPercent >= 90 && carbsPercent <= 110) {
        stats.daysMetCarbs++;
      }
      if (fatPercent >= 90 && fatPercent <= 110) {
        stats.daysMetFat++;
      }
      if (
        caloriePercent >= 90 && caloriePercent <= 110 &&
        proteinPercent >= 90 && proteinPercent <= 110 &&
        carbsPercent >= 90 && carbsPercent <= 110 &&
        fatPercent >= 90 && fatPercent <= 110
      ) {
        stats.daysMetAllMacros++;
      }
    }

    lastDate = dateStr;
  });

  return stats;
};

/**
 * Check and update user achievements
 * @param {string} userId - User ID
 * @param {Object} stats - Calculated stats
 * @returns {Promise<Object>} Updated achievements with newly unlocked
 */
export const checkAndUpdateAchievements = async (userId, stats) => {
  try {
    const currentAchievements = await getUserAchievements(userId);
    const unlockedIds = currentAchievements.data?.unlocked || [];
    const newlyUnlocked = [];

    // Check each achievement
    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      if (!unlockedIds.includes(achievement.id)) {
        // Check if achievement is now completed
        if (achievement.checkFunction(stats)) {
          unlockedIds.push(achievement.id);
          newlyUnlocked.push(achievement);
        }
      }
    });

    // Calculate progress for locked achievements
    const progress = {};
    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      if (!unlockedIds.includes(achievement.id)) {
        // Calculate progress percentage based on achievement type
        let progressPercent = 0;

        if (achievement.id.includes('streak') || achievement.id.includes('day')) {
          // Extract target number from description
          const match = achievement.description.match(/(\d+)/);
          if (match) {
            const target = parseInt(match[0]);
            const current = achievement.id.includes('breakfast') ? stats.breakfastStreak :
                          achievement.id.includes('water') ? stats.daysMetWater :
                          achievement.id.includes('protein_pro') ? stats.daysMetProtein :
                          achievement.id.includes('calorie') ? stats.daysMetCalories :
                          achievement.id.includes('balanced_diet') || achievement.id.includes('macro') ? stats.daysMetAllMacros :
                          stats.currentStreak;
            progressPercent = Math.min(100, Math.round((current / target) * 100));
          }
        } else if (achievement.id.includes('meal')) {
          const match = achievement.description.match(/(\d+)/);
          if (match) {
            const target = parseInt(match[0]);
            const current = achievement.id.includes('veggie') ? stats.mealsWithVeggies :
                          achievement.id.includes('breakfast') ? stats.balancedBreakfasts :
                          stats.totalMealsLogged;
            progressPercent = Math.min(100, Math.round((current / target) * 100));
          }
        } else if (achievement.id === 'water_warrior') {
          progressPercent = Math.min(100, Math.round((stats.maxWaterInDay / 8) * 100));
        }

        progress[achievement.id] = progressPercent;
      }
    });

    // Save updated achievements
    const achievementsRef = doc(db, 'users', userId, 'gamification', 'achievements');
    const achievementsData = {
      unlocked: unlockedIds,
      progress,
      stats,
      lastUpdated: serverTimestamp()
    };

    const achievementsSnap = await getDoc(achievementsRef);
    if (achievementsSnap.exists()) {
      await updateDoc(achievementsRef, achievementsData);
    } else {
      await setDoc(achievementsRef, {
        ...achievementsData,
        createdAt: serverTimestamp()
      });
    }

    return {
      success: true,
      data: {
        unlocked: unlockedIds,
        progress,
        newlyUnlocked
      }
    };
  } catch (error) {
    console.error('Error updating achievements:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get achievement counts by difficulty
 * @param {Array} unlockedIds - Array of unlocked achievement IDs
 * @returns {Object} Counts by difficulty
 */
export const getAchievementCounts = (unlockedIds = []) => {
  const counts = {
    total: ACHIEVEMENT_DEFINITIONS.length,
    unlocked: unlockedIds.length,
    easy: 0,
    medium: 0,
    hard: 0
  };

  unlockedIds.forEach(id => {
    const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
    if (achievement) {
      counts[achievement.difficulty]++;
    }
  });

  return counts;
};
