import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logError } from '../utils/errorLogger';

/**
 * Achievements Service - Manages user achievements and gamification
 */

// Achievement Definitions
export const ACHIEVEMENT_DEFINITIONS = [
  // ============================================
  // EASY ACHIEVEMENTS (20) - All Free
  // ============================================
  {
    id: 'first_meal',
    name: 'First Bite',
    description: 'Log your first meal',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.totalMealsLogged >= 1
  },
  {
    id: 'early_riser',
    name: 'Early Riser',
    description: 'Log breakfast before 9 AM',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.earlyBreakfasts >= 1
  },
  {
    id: 'lunch_legend',
    name: 'Lunch Legend',
    description: 'Log 5 lunches',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.lunchesLogged >= 5
  },
  {
    id: 'dinner_devotee',
    name: 'Dinner Devotee',
    description: 'Log 10 dinners',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.dinnersLogged >= 10
  },
  {
    id: 'snack_attack',
    name: 'Snack Attack',
    description: 'Log 10 snacks',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.snacksLogged >= 10
  },
  {
    id: 'scanner_rookie',
    name: 'Scanner Rookie',
    description: 'Use barcode scanner 3 times',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.barcodeSans >= 3
  },
  {
    id: 'photo_finish',
    name: 'Photo Finish',
    description: 'Log a meal with photo',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.photoLogs >= 1
  },
  {
    id: 'week_starter',
    name: 'Week Starter',
    description: 'Log meals for 3 consecutive days',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'ten_strong',
    name: 'Ten Strong',
    description: 'Log 10 total meals',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.totalMealsLogged >= 10
  },
  {
    id: 'twenty_club',
    name: 'Twenty Club',
    description: 'Log 20 total meals',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.totalMealsLogged >= 20
  },
  {
    id: 'calorie_aware',
    name: 'Calorie Aware',
    description: 'Hit calorie goal once',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.daysMetCalories >= 1
  },
  {
    id: 'protein_starter',
    name: 'Protein Starter',
    description: 'Meet protein goal 3 times',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.daysMetProtein >= 3
  },
  {
    id: 'hydration_station',
    name: 'Hydration Station',
    description: 'Drink 8 glasses of water in a day',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.maxWaterInDay >= 8
  },
  {
    id: 'veggie_victory',
    name: 'Veggie Victory',
    description: 'Log 5 meals with vegetables',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.mealsWithVeggies >= 5
  },
  {
    id: 'balanced_act',
    name: 'Balanced Act',
    description: 'Hit all macros in one day',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.daysMetAllMacros >= 1
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Complete onboarding',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.onboardingCompleted
  },
  {
    id: 'daily_driver',
    name: 'Daily Driver',
    description: 'Open app 3 days in a row',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.loginStreak >= 3
  },
  {
    id: 'goal_setter',
    name: 'Goal Setter',
    description: 'Set your nutrition goals',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.goalsSet
  },
  {
    id: 'profile_perfect',
    name: 'Profile Perfect',
    description: 'Upload a profile photo',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.hasProfilePhoto
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Log a meal after 10 PM',
    difficulty: 'easy',
    premium: false,
    xp: 50,
    checkFunction: (stats) => stats.nightLogs >= 1
  },

  // ============================================
  // MEDIUM ACHIEVEMENTS (20)
  // 10 Free, 10 Premium
  // ============================================

  // Free Medium Achievements
  {
    id: 'fifty_feast',
    name: 'Fifty Feast',
    description: 'Log 50 total meals',
    difficulty: 'medium',
    premium: false,
    xp: 150,
    checkFunction: (stats) => stats.totalMealsLogged >= 50
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Log 100 total meals',
    difficulty: 'medium',
    premium: false,
    xp: 150,
    checkFunction: (stats) => stats.totalMealsLogged >= 100
  },
  {
    id: 'breakfast_champion',
    name: 'Breakfast Champion',
    description: 'Log breakfast 14 days in a row',
    difficulty: 'medium',
    premium: false,
    xp: 150,
    checkFunction: (stats) => stats.breakfastStreak >= 14
  },
  {
    id: 'scan_master',
    name: 'Scan Master',
    description: 'Use barcode scanner 25 times',
    difficulty: 'medium',
    premium: false,
    xp: 150,
    checkFunction: (stats) => stats.barcodeScans >= 25
  },
  {
    id: 'photo_pro',
    name: 'Photo Pro',
    description: 'Log 25 meals with photos',
    difficulty: 'medium',
    premium: false,
    xp: 150,
    checkFunction: (stats) => stats.photoLogs >= 25
  },
  {
    id: 'calorie_keeper',
    name: 'Calorie Keeper',
    description: 'Stay within calorie goal 7 days',
    difficulty: 'medium',
    premium: false,
    xp: 150,
    checkFunction: (stats) => stats.daysMetCalories >= 7
  },
  {
    id: 'protein_champion',
    name: 'Protein Champion',
    description: 'Meet protein goal 14 days',
    difficulty: 'medium',
    premium: false,
    xp: 150,
    checkFunction: (stats) => stats.daysMetProtein >= 14
  },
  {
    id: 'macro_warrior',
    name: 'Macro Warrior',
    description: 'Hit all macros 7 days',
    difficulty: 'medium',
    premium: false,
    xp: 150,
    checkFunction: (stats) => stats.daysMetAllMacros >= 7
  },
  {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    description: 'Meet water goal 14 days',
    difficulty: 'medium',
    premium: false,
    xp: 150,
    checkFunction: (stats) => stats.daysMetWater >= 14
  },
  {
    id: 'streak_soldier',
    name: 'Streak Soldier',
    description: 'Maintain 14-day logging streak',
    difficulty: 'medium',
    premium: false,
    xp: 150,
    checkFunction: (stats) => stats.currentStreak >= 14
  },

  // Premium Medium Achievements
  {
    id: 'planner_apprentice',
    name: 'Planner Apprentice',
    description: 'View 7 AI personalized meals',
    difficulty: 'medium',
    premium: true,
    xp: 150,
    checkFunction: (stats) => stats.aiMealsViewed >= 7
  },
  {
    id: 'weekly_planner',
    name: 'Weekly Planner',
    description: 'Complete a full week meal plan',
    difficulty: 'medium',
    premium: true,
    xp: 150,
    checkFunction: (stats) => stats.weeklyPlansCompleted >= 1
  },
  {
    id: 'shopping_starter',
    name: 'Shopping Starter',
    description: 'Generate first grocery list',
    difficulty: 'medium',
    premium: true,
    xp: 150,
    checkFunction: (stats) => stats.groceryListsGenerated >= 1
  },
  {
    id: 'list_master',
    name: 'List Master',
    description: 'Complete 5 grocery lists',
    difficulty: 'medium',
    premium: true,
    xp: 150,
    checkFunction: (stats) => stats.groceryListsCompleted >= 5
  },
  {
    id: 'fridge_detective',
    name: 'Fridge Detective',
    description: 'Scan your fridge 5 times',
    difficulty: 'medium',
    premium: true,
    xp: 150,
    checkFunction: (stats) => stats.fridgeScans >= 5
  },
  {
    id: 'ingredient_wizard',
    name: 'Ingredient Wizard',
    description: 'Get 10 meal suggestions from scans',
    difficulty: 'medium',
    premium: true,
    xp: 150,
    checkFunction: (stats) => stats.scanSuggestions >= 10
  },
  {
    id: 'recipe_creator',
    name: 'Recipe Creator',
    description: 'Save your first custom recipe',
    difficulty: 'medium',
    premium: true,
    xp: 150,
    checkFunction: (stats) => stats.customRecipes >= 1
  },
  {
    id: 'culinary_curator',
    name: 'Culinary Curator',
    description: 'Save 10 custom recipes',
    difficulty: 'medium',
    premium: true,
    xp: 150,
    checkFunction: (stats) => stats.customRecipes >= 10
  },
  {
    id: 'data_diver',
    name: 'Data Diver',
    description: 'View analytics page 7 times',
    difficulty: 'medium',
    premium: true,
    xp: 150,
    checkFunction: (stats) => stats.analyticsViews >= 7
  },
  {
    id: 'export_expert',
    name: 'Export Expert',
    description: 'Export your nutrition data',
    difficulty: 'medium',
    premium: true,
    xp: 150,
    checkFunction: (stats) => stats.dataExports >= 1
  },

  // ============================================
  // HARD ACHIEVEMENTS (20)
  // 5 Free, 15 Premium
  // ============================================

  // Free Hard Achievements
  {
    id: 'meal_master',
    name: 'Meal Master',
    description: 'Log 500 total meals',
    difficulty: 'hard',
    premium: false,
    xp: 300,
    checkFunction: (stats) => stats.totalMealsLogged >= 500
  },
  {
    id: 'millennium_marker',
    name: 'Millennium Marker',
    description: 'Log 1000 total meals',
    difficulty: 'hard',
    premium: false,
    xp: 300,
    checkFunction: (stats) => stats.totalMealsLogged >= 1000
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Log all meals and hit all goals 7 days straight',
    difficulty: 'hard',
    premium: false,
    xp: 300,
    checkFunction: (stats) => stats.perfectWeeks >= 1
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Maintain 30-day logging streak',
    difficulty: 'hard',
    premium: false,
    xp: 300,
    checkFunction: (stats) => stats.currentStreak >= 30
  },
  {
    id: 'legendary_streak',
    name: 'Legendary Streak',
    description: 'Maintain 100-day logging streak',
    difficulty: 'hard',
    premium: false,
    xp: 300,
    checkFunction: (stats) => stats.currentStreak >= 100
  },

  // Premium Hard Achievements
  {
    id: 'monthly_planner',
    name: 'Monthly Planner',
    description: 'Complete 4 weekly meal plans',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.weeklyPlansCompleted >= 4
  },
  {
    id: 'planning_perfectionist',
    name: 'Planning Perfectionist',
    description: 'Complete 12 weekly meal plans',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.weeklyPlansCompleted >= 12
  },
  {
    id: 'ai_connoisseur',
    name: 'AI Connoisseur',
    description: 'Try 50 AI-generated recipes',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.aiRecipesTried >= 50
  },
  {
    id: 'shopping_savant',
    name: 'Shopping Savant',
    description: 'Complete 25 grocery lists',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.groceryListsCompleted >= 25
  },
  {
    id: 'bulk_buyer',
    name: 'Bulk Buyer',
    description: 'Mark 500 items as purchased',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.itemsPurchased >= 500
  },
  {
    id: 'list_legend',
    name: 'List Legend',
    description: 'Complete 50 grocery lists',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.groceryListsCompleted >= 50
  },
  {
    id: 'recipe_collector',
    name: 'Recipe Collector',
    description: 'Save 50 custom recipes',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.customRecipes >= 50
  },
  {
    id: 'recipe_virtuoso',
    name: 'Recipe Virtuoso',
    description: 'Save 100 custom recipes',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.customRecipes >= 100
  },
  {
    id: 'five_star_chef',
    name: 'Five Star Chef',
    description: 'Get 25 recipes rated 5 stars',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.fiveStarRecipes >= 25
  },
  {
    id: 'macro_genius',
    name: 'Macro Genius',
    description: 'Hit all macros 30 days',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.daysMetAllMacros >= 30
  },
  {
    id: 'nutrition_perfectionist',
    name: 'Nutrition Perfectionist',
    description: 'Hit all goals 60 days straight',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.daysMetAllMacros >= 60
  },
  {
    id: 'hydration_immortal',
    name: 'Hydration Immortal',
    description: 'Meet water goal 90 days',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.daysMetWater >= 90
  },
  {
    id: 'century_streak',
    name: 'Century Streak',
    description: 'Maintain 180-day logging streak',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.currentStreak >= 180
  },
  {
    id: 'eternal_dedication',
    name: 'Eternal Dedication',
    description: 'Maintain 365-day logging streak',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.currentStreak >= 365
  },
  {
    id: 'nutrio_legend',
    name: 'Nutrio Legend',
    description: 'Unlock ALL other 59 achievements',
    difficulty: 'hard',
    premium: true,
    xp: 300,
    checkFunction: (stats) => stats.achievementsUnlocked >= 59
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
    logError('achievementsService.getUserAchievements', error, { userId });
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
    logError('achievementsService.updateAchievements', error, { userId });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get achievement counts by difficulty
 * @param {Array} unlockedIds - Array of unlocked achievement IDs
 * @param {boolean} isPremium - Whether user is premium
 * @returns {Object} Counts by difficulty
 */
export const getAchievementCounts = (unlockedIds = [], isPremium = false) => {
  const allAchievements = ACHIEVEMENT_DEFINITIONS;
  const accessibleAchievements = isPremium
    ? allAchievements
    : allAchievements.filter(a => !a.premium);

  const counts = {
    total: allAchievements.length,
    accessible: accessibleAchievements.length,
    locked: allAchievements.length - accessibleAchievements.length,
    unlocked: unlockedIds.length,
    easy: 0,
    easyTotal: allAchievements.filter(a => a.difficulty === 'easy').length,
    medium: 0,
    mediumTotal: allAchievements.filter(a => a.difficulty === 'medium').length,
    hard: 0,
    hardTotal: allAchievements.filter(a => a.difficulty === 'hard').length,
    premium: allAchievements.filter(a => a.premium).length,
    free: allAchievements.filter(a => !a.premium).length
  };

  unlockedIds.forEach(id => {
    const achievement = allAchievements.find(a => a.id === id);
    if (achievement) {
      counts[achievement.difficulty]++;
    }
  });

  return counts;
};

/**
 * Check if user can unlock achievement (not premium-locked)
 * @param {Object} achievement - Achievement definition
 * @param {boolean} isPremium - Whether user is premium
 * @returns {boolean} Can unlock
 */
export const canUnlockAchievement = (achievement, isPremium) => {
  if (!achievement.premium) return true;
  return isPremium;
};
