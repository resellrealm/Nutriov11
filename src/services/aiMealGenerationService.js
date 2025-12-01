import { GoogleGenerativeAI } from '@google/generative-ai';
import { db, isFirebaseFullyInitialized } from '../config/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';

// Initialize Gemini AI
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// 72 Categories: 6 Goals × 12 Dietary Types
export const MEAL_GOALS = [
  'lose_weight',
  'maintain',
  'gain_muscle',
  'improve_health',
  'manage_condition',
  'athletic_performance'
];

export const DIETARY_TYPES = [
  'none', // Omnivore with no restrictions
  'vegetarian',
  'vegan',
  'pescatarian',
  'paleo',
  'keto',
  'low_carb',
  'gluten_free',
  'dairy_free',
  'halal',
  'kosher',
  'omnivore'
];

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

/**
 * Get the current week number (1-52)
 */
export const getCurrentWeekNumber = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - startOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
};

/**
 * Generate category ID from goal and dietary type
 */
export const getCategoryId = (goal, dietaryType) => {
  return `${goal}_${dietaryType}`;
};

/**
 * Get all 72 category IDs
 */
export const getAllCategories = () => {
  const categories = [];
  MEAL_GOALS.forEach(goal => {
    DIETARY_TYPES.forEach(dietaryType => {
      categories.push(getCategoryId(goal, dietaryType));
    });
  });
  return categories;
};

/**
 * Match user profile to best category
 */
export const getUserCategory = (userProfile) => {
  const { primaryGoal, dietaryRestrictions } = userProfile;

  // Default to first dietary restriction if multiple selected
  let dietaryType = 'none';
  if (dietaryRestrictions && dietaryRestrictions.length > 0) {
    // Prioritize specific diets
    const priority = ['vegan', 'vegetarian', 'keto', 'paleo', 'pescatarian', 'gluten_free', 'dairy_free', 'halal', 'kosher'];
    for (const diet of priority) {
      if (dietaryRestrictions.includes(diet)) {
        dietaryType = diet;
        break;
      }
    }
    if (dietaryType === 'none' && !dietaryRestrictions.includes('none')) {
      dietaryType = dietaryRestrictions[0];
    }
  }

  return getCategoryId(primaryGoal || 'improve_health', dietaryType);
};

/**
 * Generate a single meal using Gemini AI
 */
const generateSingleMeal = async (mealType, goal, dietaryType, dayNumber) => {
  if (!genAI) {
    throw new Error('Gemini AI is not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Craft detailed prompt based on goal and dietary type
  const goalDescriptions = {
    lose_weight: 'weight loss with calorie deficit (300-400 calories)',
    maintain: 'maintaining current weight with balanced nutrition (350-450 calories)',
    gain_muscle: 'muscle gain with high protein (450-550 calories)',
    improve_health: 'overall health improvement with nutrient-dense foods (350-450 calories)',
    manage_condition: 'managing health conditions with anti-inflammatory foods (350-450 calories)',
    athletic_performance: 'athletic performance with optimal energy (400-500 calories)'
  };

  const dietaryDescriptions = {
    none: 'no dietary restrictions, can include any ingredients',
    vegetarian: 'vegetarian (no meat or fish, but includes eggs and dairy)',
    vegan: 'vegan (no animal products whatsoever)',
    pescatarian: 'pescatarian (fish allowed, no other meat)',
    paleo: 'paleo (no grains, dairy, or processed foods)',
    keto: 'ketogenic (very low carb, high fat, under 20g net carbs)',
    low_carb: 'low carbohydrate (under 40g carbs)',
    gluten_free: 'gluten-free (no wheat, barley, rye)',
    dairy_free: 'dairy-free (no milk, cheese, yogurt)',
    halal: 'halal (follows Islamic dietary laws)',
    kosher: 'kosher (follows Jewish dietary laws)',
    omnivore: 'omnivore with balanced macros'
  };

  const mealTypeDescriptions = {
    breakfast: 'breakfast meal',
    lunch: 'lunch meal',
    dinner: 'dinner meal',
    snack: 'healthy snack'
  };

  const prompt = `Generate a detailed ${mealTypeDescriptions[mealType]} recipe for someone with the goal of ${goalDescriptions[goal]} following a ${dietaryDescriptions[dietaryType]} diet.

Requirements:
- Unique and creative recipe (Day ${dayNumber} of 7 - make it different from typical meals)
- Must strictly follow ${dietaryType} dietary requirements
- Optimized for ${goal} goal
- Include complete cooking instructions
- Realistic cooking time
- Accurate nutritional information

Return ONLY valid JSON (no markdown, no extra text) in this EXACT format:
{
  "name": "Recipe Name",
  "description": "One sentence description",
  "calories": 400,
  "protein": 30,
  "carbs": 35,
  "fat": 15,
  "fiber": 8,
  "cookTime": "25 min",
  "difficulty": "Easy",
  "mealType": "${mealType}",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "prepTime": "10 min",
  "servings": 1
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    const meal = JSON.parse(cleanedText);

    // Add metadata
    meal.id = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    meal.category = getCategoryId(goal, dietaryType);
    meal.goal = goal;
    meal.dietaryType = dietaryType;
    meal.dayNumber = dayNumber;
    meal.generatedAt = new Date().toISOString();
    meal.source = 'ai_generated';

    return meal;
  } catch (error) {
    console.error('Error generating meal:', error);
    throw error;
  }
};

/**
 * Generate 28 meals for a single category (7 days × 4 meal types)
 */
export const generateCategoryMeals = async (goal, dietaryType, onProgress = null) => {
  const meals = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  };

  let completed = 0;
  const total = 28;

  try {
    // Generate 7 meals for each meal type
    for (const mealType of MEAL_TYPES) {
      for (let day = 1; day <= 7; day++) {
        const meal = await generateSingleMeal(mealType, goal, dietaryType, day);
        meals[mealType].push(meal);
        completed++;

        if (onProgress) {
          onProgress({ completed, total, mealType, day });
        }

        // Rate limiting: wait 1 second between requests (Gemini free tier: 60 req/min)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return meals;
  } catch (error) {
    console.error(`Error generating meals for ${goal}_${dietaryType}:`, error);
    throw error;
  }
};

/**
 * Save generated meals to Firestore
 */
export const saveMealsToFirestore = async (weekNumber, categoryId, meals) => {
  if (!isFirebaseFullyInitialized || !db) {
    throw new Error('Firestore is not configured');
  }

  try {
    const weekDoc = doc(db, 'weeklyMeals', `week_${weekNumber}`);
    const categoryDoc = doc(collection(weekDoc, 'categories'), categoryId);

    await setDoc(categoryDoc, {
      categoryId,
      weekNumber,
      meals,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Saved ${categoryId} to Firestore`);
    return true;
  } catch (error) {
    console.error(`Error saving ${categoryId} to Firestore:`, error);
    throw error;
  }
};

/**
 * Fetch meals from Firestore for a specific category and week
 */
export const fetchMealsFromFirestore = async (weekNumber, categoryId) => {
  if (!isFirebaseFullyInitialized || !db) {
    return null;
  }

  try {
    const weekDoc = doc(db, 'weeklyMeals', `week_${weekNumber}`);
    const categoryDoc = doc(collection(weekDoc, 'categories'), categoryId);

    const docSnap = await getDoc(categoryDoc);

    if (docSnap.exists()) {
      return docSnap.data().meals;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ${categoryId} from Firestore:`, error);
    return null;
  }
};

/**
 * Generate meals for all 72 categories (Sunday batch generation)
 * This should be run weekly, ideally as a scheduled job
 */
export const generateAllCategoryMeals = async (onProgress = null) => {
  const weekNumber = getCurrentWeekNumber();
  const allCategories = getAllCategories();
  const totalCategories = allCategories.length;
  let completedCategories = 0;

  console.log(`🚀 Starting weekly meal generation for Week ${weekNumber}`);
  console.log(`📊 Generating ${totalCategories} categories × 28 meals = ${totalCategories * 28} total meals`);

  const results = {
    success: [],
    failed: []
  };

  for (const categoryId of allCategories) {
    const [goal, dietaryType] = categoryId.split('_');

    try {
      console.log(`\n🔄 Generating ${categoryId}... (${completedCategories + 1}/${totalCategories})`);

      const meals = await generateCategoryMeals(goal, dietaryType, (progress) => {
        if (onProgress) {
          onProgress({
            category: categoryId,
            categoryProgress: progress,
            totalCategories,
            completedCategories
          });
        }
      });

      await saveMealsToFirestore(weekNumber, categoryId, meals);

      results.success.push(categoryId);
      completedCategories++;

      console.log(`✅ Completed ${categoryId} (${completedCategories}/${totalCategories})`);

    } catch (error) {
      console.error(`❌ Failed to generate ${categoryId}:`, error);
      results.failed.push({ categoryId, error: error.message });
    }
  }

  console.log(`\n🎉 Weekly generation complete!`);
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  return results;
};

/**
 * Get meals for user based on their profile
 * Includes allergy filtering
 */
export const getMealsForUser = async (userProfile) => {
  const weekNumber = getCurrentWeekNumber();
  const categoryId = getUserCategory(userProfile);

  // Try to fetch from Firestore
  let meals = await fetchMealsFromFirestore(weekNumber, categoryId);

  // If no meals found, return null (will fallback to static recipes)
  if (!meals) {
    console.warn(`No AI meals found for ${categoryId} in week ${weekNumber}`);
    return null;
  }

  // Filter meals based on allergies
  if (userProfile.allergies && userProfile.allergies.length > 0 && !userProfile.allergies.includes('none')) {
    meals = filterMealsByAllergies(meals, userProfile.allergies);
  }

  return meals;
};

/**
 * Filter meals to exclude allergens
 */
const filterMealsByAllergies = (meals, allergies) => {
  // Map allergy names to common ingredient keywords
  const allergenKeywords = {
    peanuts: ['peanut', 'peanuts'],
    tree_nuts: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'nut'],
    shellfish: ['shrimp', 'crab', 'lobster', 'shellfish', 'prawn', 'crayfish'],
    fish: ['salmon', 'tuna', 'cod', 'fish', 'tilapia', 'trout', 'halibut'],
    eggs: ['egg', 'eggs'],
    dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy', 'whey', 'casein'],
    soy: ['soy', 'tofu', 'tempeh', 'edamame', 'miso'],
    wheat: ['wheat', 'flour', 'bread', 'pasta', 'couscous'],
    sesame: ['sesame', 'tahini']
  };

  const filteredMeals = {};

  Object.keys(meals).forEach(mealType => {
    filteredMeals[mealType] = meals[mealType].filter(meal => {
      // Check if any ingredient contains allergen
      const ingredientsText = meal.ingredients.join(' ').toLowerCase();

      for (const allergy of allergies) {
        // Handle custom allergies (format: "other:custom_name")
        if (allergy.startsWith('other:')) {
          const customAllergen = allergy.split(':')[1].toLowerCase();
          if (ingredientsText.includes(customAllergen)) {
            return false; // Exclude this meal
          }
        } else if (allergenKeywords[allergy]) {
          // Check predefined allergens
          for (const keyword of allergenKeywords[allergy]) {
            if (ingredientsText.includes(keyword)) {
              return false; // Exclude this meal
            }
          }
        }
      }

      return true; // Include this meal
    });
  });

  return filteredMeals;
};

/**
 * Get a random "Meal of the Day" for user
 */
export const getMealOfTheDay = async (userProfile, mealType = null) => {
  const meals = await getMealsForUser(userProfile);

  if (!meals) {
    return null;
  }

  // If mealType specified, get from that type, otherwise random
  const availableMealTypes = mealType ? [mealType] : MEAL_TYPES;
  const randomMealType = availableMealTypes[Math.floor(Math.random() * availableMealTypes.length)];
  const mealsOfType = meals[randomMealType];

  if (!mealsOfType || mealsOfType.length === 0) {
    return null;
  }

  // Return random meal from the type
  return mealsOfType[Math.floor(Math.random() * mealsOfType.length)];
};

export default {
  getCurrentWeekNumber,
  getCategoryId,
  getAllCategories,
  getUserCategory,
  generateCategoryMeals,
  generateAllCategoryMeals,
  getMealsForUser,
  getMealOfTheDay,
  saveMealsToFirestore,
  fetchMealsFromFirestore
};
