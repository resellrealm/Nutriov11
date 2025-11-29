/**
 * Smart Meal Recommendation Service
 * Analyzes user's nutritional intake and provides personalized meal recommendations
 */

import { BUILT_IN_RECIPES } from './recipeService';
import { DEFAULT_CALORIE_TARGET, DEFAULT_PROTEIN_TARGET } from '../config/constants';

/**
 * Analyze nutritional gaps based on today's intake vs goals
 */
export const analyzeNutritionalGaps = (todayIntake, userGoals, userProfile) => {
  const goals = {
    calories: userGoals?.calories || userProfile?.calculated?.recommendedCalories || DEFAULT_CALORIE_TARGET,
    protein: userGoals?.protein || userProfile?.calculated?.macros?.proteinGrams || DEFAULT_PROTEIN_TARGET,
    carbs: userGoals?.carbs || userProfile?.calculated?.macros?.carbsGrams || 250,
    fat: userGoals?.fat || userProfile?.calculated?.macros?.fatGrams || 70,
    fiber: userGoals?.fiber || 30,
  };

  const current = {
    calories: todayIntake?.calories || 0,
    protein: todayIntake?.protein || 0,
    carbs: todayIntake?.carbs || 0,
    fat: todayIntake?.fat || 0,
    fiber: todayIntake?.fiber || 0,
  };

  const gaps = {
    calories: Math.max(0, goals.calories - current.calories),
    protein: Math.max(0, goals.protein - current.protein),
    carbs: Math.max(0, goals.carbs - current.carbs),
    fat: Math.max(0, goals.fat - current.fat),
    fiber: Math.max(0, goals.fiber - current.fiber),
  };

  const percentages = {
    calories: goals.calories > 0 ? Math.round((current.calories / goals.calories) * 100) : 0,
    protein: goals.protein > 0 ? Math.round((current.protein / goals.protein) * 100) : 0,
    carbs: goals.carbs > 0 ? Math.round((current.carbs / goals.carbs) * 100) : 0,
    fat: goals.fat > 0 ? Math.round((current.fat / goals.fat) * 100) : 0,
    fiber: goals.fiber > 0 ? Math.round((current.fiber / goals.fiber) * 100) : 0,
  };

  // Identify biggest deficiencies (sorted by percentage remaining)
  const deficiencies = Object.entries(percentages)
    .map(([nutrient, percentage]) => ({
      nutrient,
      percentage,
      remaining: gaps[nutrient],
      goal: goals[nutrient],
      priority: 100 - percentage, // Higher priority = bigger gap
    }))
    .filter(d => d.percentage < 100)
    .sort((a, b) => b.priority - a.priority);

  return {
    goals,
    current,
    gaps,
    percentages,
    deficiencies,
    hasDeficiencies: deficiencies.length > 0,
  };
};

/**
 * Calculate how well a recipe fills nutritional gaps
 */
const calculateRecipeFitScore = (recipe, gaps, primaryGoal, deficiencies) => {
  let score = 0;
  let reasons = [];

  // Base score on how well it fills the biggest gaps
  if (deficiencies.length > 0) {
    const topDeficiency = deficiencies[0];
    const nutrient = topDeficiency.nutrient;

    if (recipe[nutrient]) {
      const fillPercentage = (recipe[nutrient] / topDeficiency.remaining) * 100;
      score += Math.min(fillPercentage, 100) * 0.4; // 40% weight

      if (fillPercentage >= 50) {
        reasons.push(`Provides ${Math.round(fillPercentage)}% of remaining ${nutrient}`);
      }
    }
  }

  // Goal-specific scoring
  switch (primaryGoal) {
    case 'lose_weight':
      // Prefer lower calorie, high protein, high fiber
      if (recipe.calories <= 400) {
        score += 20;
        reasons.push('Low calorie for weight loss');
      }
      if (recipe.protein >= 25) {
        score += 15;
        reasons.push('High protein keeps you full');
      }
      if (recipe.fiber >= 8) {
        score += 10;
        reasons.push('High fiber for satiety');
      }
      break;

    case 'gain_muscle':
      // Prefer high protein, moderate carbs
      if (recipe.protein >= 30) {
        score += 25;
        reasons.push('Excellent protein for muscle building');
      }
      if (recipe.carbs >= 40) {
        score += 15;
        reasons.push('Good carbs for energy and recovery');
      }
      break;

    case 'improve_health':
      // Prefer balanced, nutrient-dense
      if (recipe.fiber >= 6) {
        score += 15;
        reasons.push('Good fiber for digestive health');
      }
      if (recipe.tags?.includes('Heart Healthy') || recipe.tags?.includes('Omega-3')) {
        score += 20;
        reasons.push('Heart-healthy nutrients');
      }
      break;

    case 'maintain':
      // Prefer balanced macros
      const isBalanced = recipe.protein >= 20 && recipe.carbs >= 30 && recipe.fat >= 10;
      if (isBalanced) {
        score += 20;
        reasons.push('Well-balanced macros');
      }
      break;
  }

  // Bonus for filling multiple gaps
  let gapsFilled = 0;
  if (gaps.protein > 0 && recipe.protein >= gaps.protein * 0.3) gapsFilled++;
  if (gaps.carbs > 0 && recipe.carbs >= gaps.carbs * 0.2) gapsFilled++;
  if (gaps.fat > 0 && recipe.fat >= gaps.fat * 0.2) gapsFilled++;
  if (gaps.fiber > 0 && recipe.fiber >= gaps.fiber * 0.3) gapsFilled++;

  if (gapsFilled >= 2) {
    score += gapsFilled * 5;
    reasons.push(`Fills ${gapsFilled} nutritional needs`);
  }

  // Penalty if it exceeds calorie budget
  if (gaps.calories > 0 && recipe.calories > gaps.calories * 1.2) {
    score -= 20;
    reasons.push('⚠️ May exceed calorie budget');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
  };
};

/**
 * Get personalized meal recommendations
 */
export const getPersonalizedRecommendations = (todayIntake, userProfile, options = {}) => {
  const {
    mealType = null, // breakfast, lunch, dinner, snack
    limit = 5,
    excludeRecipeIds = [],
  } = options;

  // Get user's primary goal
  const primaryGoal = userProfile?.goals?.primary || 'maintain';

  // Analyze nutritional gaps
  const analysis = analyzeNutritionalGaps(
    todayIntake,
    userProfile?.goals,
    userProfile
  );

  // Filter recipes
  let recipes = BUILT_IN_RECIPES.filter(recipe => {
    if (excludeRecipeIds.includes(recipe.id)) return false;
    if (mealType && recipe.mealType !== mealType) return false;
    return true;
  });

  // Score and rank recipes
  const scoredRecipes = recipes.map(recipe => {
    const fit = calculateRecipeFitScore(
      recipe,
      analysis.gaps,
      primaryGoal,
      analysis.deficiencies
    );

    return {
      ...recipe,
      fitScore: fit.score,
      reasons: fit.reasons,
      nutritionalImpact: {
        caloriesProvided: recipe.calories,
        proteinProvided: recipe.protein,
        willFillCalories: analysis.gaps.calories > 0
          ? Math.round((recipe.calories / analysis.gaps.calories) * 100)
          : 0,
        willFillProtein: analysis.gaps.protein > 0
          ? Math.round((recipe.protein / analysis.gaps.protein) * 100)
          : 0,
      },
    };
  });

  // Sort by fit score
  scoredRecipes.sort((a, b) => b.fitScore - a.fitScore);

  return {
    recommendations: scoredRecipes.slice(0, limit),
    analysis,
    primaryGoal,
  };
};

/**
 * Get "Meal of the Day" personalized to user
 */
export const getPersonalizedMealOfTheDay = (todayIntake, userProfile) => {
  const result = getPersonalizedRecommendations(todayIntake, userProfile, { limit: 1 });

  if (result.recommendations.length === 0) {
    // Fallback to random recipe
    const randomIndex = Math.floor(Math.random() * BUILT_IN_RECIPES.length);
    return {
      meal: BUILT_IN_RECIPES[randomIndex],
      reasons: ['A delicious and balanced meal for you'],
      analysis: result.analysis,
    };
  }

  return {
    meal: result.recommendations[0],
    reasons: result.recommendations[0].reasons,
    analysis: result.analysis,
  };
};

/**
 * Get foods to add based on missing nutrients
 */
export const getFoodSuggestionsForDeficiencies = (analysis) => {
  const suggestions = [];

  // Nutrient -> Food suggestions mapping
  const nutrientFoodMap = {
    protein: [
      { food: 'Grilled Chicken Breast', amount: '150g', provides: '35g protein' },
      { food: 'Greek Yogurt', amount: '200g', provides: '20g protein' },
      { food: 'Eggs', amount: '2 large', provides: '12g protein' },
      { food: 'Salmon', amount: '150g', provides: '30g protein' },
      { food: 'Tofu', amount: '150g', provides: '15g protein' },
    ],
    fiber: [
      { food: 'Chickpeas', amount: '1 cup', provides: '12g fiber' },
      { food: 'Raspberries', amount: '1 cup', provides: '8g fiber' },
      { food: 'Oatmeal', amount: '1 cup', provides: '8g fiber' },
      { food: 'Broccoli', amount: '1 cup', provides: '5g fiber' },
      { food: 'Quinoa', amount: '1 cup', provides: '5g fiber' },
    ],
    carbs: [
      { food: 'Brown Rice', amount: '1 cup', provides: '45g carbs' },
      { food: 'Sweet Potato', amount: '1 medium', provides: '26g carbs' },
      { food: 'Banana', amount: '1 medium', provides: '27g carbs' },
      { food: 'Oats', amount: '1 cup', provides: '54g carbs' },
    ],
    fat: [
      { food: 'Avocado', amount: '1 medium', provides: '22g fat' },
      { food: 'Almonds', amount: '30g', provides: '15g fat' },
      { food: 'Olive Oil', amount: '1 tbsp', provides: '14g fat' },
      { food: 'Salmon', amount: '150g', provides: '12g fat (omega-3)' },
    ],
  };

  analysis.deficiencies.forEach(deficiency => {
    if (deficiency.percentage < 80 && nutrientFoodMap[deficiency.nutrient]) {
      const foods = nutrientFoodMap[deficiency.nutrient];
      suggestions.push({
        nutrient: deficiency.nutrient,
        remaining: Math.round(deficiency.remaining),
        percentage: deficiency.percentage,
        foods: foods.slice(0, 3), // Top 3 suggestions
        priority: deficiency.priority,
      });
    }
  });

  return suggestions.sort((a, b) => b.priority - a.priority);
};

/**
 * Generate insights about nutrition status
 */
export const generateNutritionInsights = (analysis, primaryGoal) => {
  const insights = [];

  // Overall status
  const avgPercentage = Math.round(
    Object.values(analysis.percentages).reduce((sum, p) => sum + p, 0) /
    Object.values(analysis.percentages).length
  );

  if (avgPercentage >= 90) {
    insights.push({
      type: 'success',
      icon: '🎉',
      message: 'Excellent! You\'re on track with your nutrition goals today.',
      priority: 1,
    });
  } else if (avgPercentage >= 70) {
    insights.push({
      type: 'info',
      icon: '👍',
      message: 'Good progress! You\'re doing well with your nutrition.',
      priority: 2,
    });
  } else if (avgPercentage >= 50) {
    insights.push({
      type: 'warning',
      icon: '💪',
      message: 'Keep going! You still have room to hit your nutrition targets.',
      priority: 3,
    });
  } else {
    insights.push({
      type: 'info',
      icon: '🍽️',
      message: 'Plenty of nutrition goals left to achieve today!',
      priority: 3,
    });
  }

  // Specific nutrient insights
  if (analysis.deficiencies.length > 0) {
    const topDeficiency = analysis.deficiencies[0];

    if (topDeficiency.percentage < 50) {
      let message = '';

      switch (topDeficiency.nutrient) {
        case 'protein':
          message = `You need ${Math.round(topDeficiency.remaining)}g more protein. ${
            primaryGoal === 'gain_muscle'
              ? 'Critical for muscle growth!'
              : primaryGoal === 'lose_weight'
              ? 'Protein helps you stay full and preserve muscle.'
              : 'Important for recovery and satiety.'
          }`;
          break;
        case 'fiber':
          message = `You need ${Math.round(topDeficiency.remaining)}g more fiber for digestive health and fullness.`;
          break;
        case 'calories':
          message = `You have ${Math.round(topDeficiency.remaining)} calories left for today.`;
          break;
        case 'carbs':
          message = `You need ${Math.round(topDeficiency.remaining)}g more carbs for energy.`;
          break;
        case 'fat':
          message = `You need ${Math.round(topDeficiency.remaining)}g more healthy fats.`;
          break;
      }

      insights.push({
        type: 'warning',
        icon: '🎯',
        message,
        priority: 2,
      });
    }
  }

  // Goal-specific insights
  if (primaryGoal === 'lose_weight' && analysis.percentages.calories > 90) {
    insights.push({
      type: 'success',
      icon: '✨',
      message: 'Great job staying within your calorie deficit for weight loss!',
      priority: 1,
    });
  }

  if (primaryGoal === 'gain_muscle' && analysis.percentages.protein >= 90) {
    insights.push({
      type: 'success',
      icon: '💪',
      message: 'Excellent protein intake for muscle building!',
      priority: 1,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
};

export default {
  analyzeNutritionalGaps,
  getPersonalizedRecommendations,
  getPersonalizedMealOfTheDay,
  getFoodSuggestionsForDeficiencies,
  generateNutritionInsights,
};
