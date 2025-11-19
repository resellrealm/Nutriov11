import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Grocery List Generator Service
 * Implements complex algorithm for generating personalized, budget-conscious grocery lists
 */

// Ingredient price database (simplified - in production, use API or maintain comprehensive DB)
const INGREDIENT_PRICES = {
  // Proteins (per lb or unit)
  chicken: { price: 3.99, unit: 'lb', organic: 7.99 },
  beef: { price: 6.99, unit: 'lb', organic: 12.99 },
  pork: { price: 4.99, unit: 'lb', organic: 8.99 },
  fish: { price: 8.99, unit: 'lb', organic: 12.99 },
  salmon: { price: 12.99, unit: 'lb', organic: 18.99 },
  tofu: { price: 2.99, unit: 'pack', organic: 4.99 },
  eggs: { price: 3.99, unit: 'dozen', organic: 6.99 },
  turkey: { price: 4.99, unit: 'lb', organic: 8.99 },

  // Vegetables (per lb)
  broccoli: { price: 2.49, unit: 'lb', organic: 3.99 },
  spinach: { price: 3.99, unit: 'bunch', organic: 5.99 },
  carrots: { price: 1.99, unit: 'lb', organic: 2.99 },
  tomatoes: { price: 2.99, unit: 'lb', organic: 4.99 },
  peppers: { price: 1.99, unit: 'each', organic: 2.99 },
  onions: { price: 1.49, unit: 'lb', organic: 2.49 },
  garlic: { price: 0.79, unit: 'head', organic: 1.29 },
  mushrooms: { price: 3.99, unit: 'pack', organic: 5.99 },

  // Fruits (per lb)
  apples: { price: 1.99, unit: 'lb', organic: 3.99 },
  bananas: { price: 0.59, unit: 'lb', organic: 0.89 },
  berries: { price: 4.99, unit: 'pack', organic: 6.99 },
  oranges: { price: 1.49, unit: 'lb', organic: 2.99 },

  // Grains & Staples
  rice: { price: 2.99, unit: '2lb bag', organic: 4.99 },
  pasta: { price: 1.99, unit: 'box', organic: 3.49 },
  bread: { price: 2.99, unit: 'loaf', organic: 4.99 },
  quinoa: { price: 5.99, unit: 'lb', organic: 8.99 },
  oats: { price: 3.99, unit: 'container', organic: 5.99 },

  // Dairy
  milk: { price: 3.99, unit: 'gallon', organic: 6.99 },
  cheese: { price: 4.99, unit: 'pack', organic: 7.99 },
  yogurt: { price: 4.99, unit: 'container', organic: 6.99 },
  butter: { price: 3.99, unit: 'lb', organic: 6.99 },

  // Pantry
  olive_oil: { price: 8.99, unit: 'bottle', organic: 12.99 },
  soy_sauce: { price: 3.99, unit: 'bottle', organic: 5.99 },
  canned_tomatoes: { price: 1.99, unit: 'can', organic: 2.99 },
  beans: { price: 1.49, unit: 'can', organic: 2.49 }
};

// Cuisine-specific staple items
const CUISINE_STAPLES = {
  italian: ['olive_oil', 'garlic', 'onions', 'canned_tomatoes', 'pasta', 'cheese'],
  mexican: ['beans', 'rice', 'onions', 'peppers', 'tomatoes', 'tortillas'],
  asian: ['soy_sauce', 'rice', 'garlic', 'ginger', 'sesame_oil'],
  indian: ['rice', 'onions', 'garlic', 'ginger', 'yogurt', 'spices'],
  mediterranean: ['olive_oil', 'garlic', 'tomatoes', 'onions', 'feta_cheese'],
  middle_eastern: ['olive_oil', 'garlic', 'chickpeas', 'tahini', 'lemon'],
  american: ['butter', 'milk', 'eggs', 'bread', 'cheese']
};

// Household scaling factors by age group
const SCALING_FACTORS = {
  adult: 1.0,
  child_0_4: 0.3,
  child_5_9: 0.5,
  child_10_14: 0.75,
  child_15_18: 0.9
};

/**
 * Calculate household scaling factor
 */
export const calculateHouseholdScaling = (household) => {
  let totalScaling = 0;

  // Add adults
  const adultCount = household.adultCount || household.totalMembers - household.childrenCount;
  totalScaling += adultCount * SCALING_FACTORS.adult;

  // Add children by age
  if (household.hasChildren && household.childrenAges) {
    household.childrenAges.forEach(age => {
      if (age <= 4) totalScaling += SCALING_FACTORS.child_0_4;
      else if (age <= 9) totalScaling += SCALING_FACTORS.child_5_9;
      else if (age <= 14) totalScaling += SCALING_FACTORS.child_10_14;
      else totalScaling += SCALING_FACTORS.child_15_18;
    });
  }

  return totalScaling;
};

/**
 * Get ingredient price with organic option
 */
export const getIngredientPrice = (ingredient, preferOrganic = false) => {
  const priceData = INGREDIENT_PRICES[ingredient.toLowerCase().replace(/\s+/g, '_')];
  if (!priceData) return { price: 5.0, unit: 'item' }; // Default price

  return {
    price: preferOrganic && priceData.organic ? priceData.organic : priceData.price,
    unit: priceData.unit
  };
};

/**
 * Generate staple items based on cuisine preferences
 */
export const generateStapleItems = (cuisinePreferences) => {
  const staples = new Set();

  cuisinePreferences.forEach(cuisine => {
    const cuisineStaples = CUISINE_STAPLES[cuisine] || [];
    cuisineStaples.forEach(staple => staples.add(staple));
  });

  return Array.from(staples).map(staple => ({
    id: `staple_${staple}`,
    name: staple.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    quantity: 1,
    unit: INGREDIENT_PRICES[staple]?.unit || 'item',
    category: categorizeIngredient(staple),
    estimatedPrice: INGREDIENT_PRICES[staple]?.price || 5.0,
    priority: 'staple',
    forMeals: [],
    checked: false,
    purchased: false
  }));
};

/**
 * Categorize ingredient
 */
export const categorizeIngredient = (ingredient) => {
  const name = ingredient.toLowerCase();

  if (['chicken', 'beef', 'pork', 'fish', 'salmon', 'tofu', 'turkey', 'eggs'].some(p => name.includes(p))) {
    return 'proteins';
  }
  if (['broccoli', 'spinach', 'carrots', 'tomatoes', 'peppers', 'onions', 'garlic', 'mushrooms', 'lettuce', 'cucumber'].some(v => name.includes(v))) {
    return 'produce';
  }
  if (['apples', 'bananas', 'berries', 'oranges', 'grapes', 'mango'].some(f => name.includes(f))) {
    return 'produce';
  }
  if (['milk', 'cheese', 'yogurt', 'butter'].some(d => name.includes(d))) {
    return 'dairy';
  }
  if (['rice', 'pasta', 'bread', 'quinoa', 'oats'].some(g => name.includes(g))) {
    return 'grains_bread';
  }
  if (['oil', 'sauce', 'canned', 'beans', 'spices'].some(p => name.includes(p))) {
    return 'pantry';
  }

  return 'other';
};

/**
 * Filter ingredients by dietary restrictions
 */
export const filterByDietaryRestrictions = (items, dietaryRestrictions, allergies) => {
  return items.filter(item => {
    const name = item.name.toLowerCase();

    // Check allergies (HARD FILTER)
    for (const allergy of allergies) {
      if (allergy === 'none') continue;
      const allergyName = allergy.replace('other:', '').toLowerCase();
      if (name.includes(allergyName)) {
        return false; // Exclude this item
      }
    }

    // Check dietary restrictions
    for (const restriction of dietaryRestrictions) {
      if (restriction === 'vegan') {
        if (['chicken', 'beef', 'pork', 'fish', 'eggs', 'milk', 'cheese', 'yogurt', 'butter'].some(m => name.includes(m))) {
          return false;
        }
      }
      if (restriction === 'vegetarian') {
        if (['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey'].some(m => name.includes(m))) {
          return false;
        }
      }
      if (restriction === 'dairy_free') {
        if (['milk', 'cheese', 'yogurt', 'butter'].some(d => name.includes(d))) {
          return false;
        }
      }
      if (restriction === 'gluten_free') {
        if (['bread', 'pasta'].some(g => name.includes(g))) {
          return false;
        }
      }
    }

    return true;
  });
};

/**
 * Apply budget constraints
 */
export const applyBudgetConstraints = (items, budget, budgetPriority) => {
  const totalCost = items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

  let warnings = [];
  let suggestions = [];
  let budgetStatus = 'under';

  if (totalCost > budget.weekly) {
    const overage = totalCost - budget.weekly;
    const overagePercent = (overage / budget.weekly) * 100;

    if (budgetPriority === 'strict') {
      budgetStatus = 'over';
      warnings.push({
        type: 'over_budget',
        message: `Total cost $${totalCost.toFixed(2)} exceeds budget by $${overage.toFixed(2)}`
      });

      // Remove optional items first
      items = items.filter(item => item.priority !== 'optional');

      // Suggest cheaper alternatives
      items.forEach(item => {
        if (item.estimatedPrice > 10) {
          item.alternativeSuggestion = `Consider a cheaper alternative to save money`;
        }
      });

    } else if (budgetPriority === 'flexible' && overagePercent > 15) {
      budgetStatus = 'over';
      warnings.push({
        type: 'over_budget_flexible',
        message: `Total cost $${totalCost.toFixed(2)} is ${overagePercent.toFixed(0)}% over budget`
      });
    }
  } else if (totalCost < budget.weekly * 0.9) {
    budgetStatus = 'under';
    const savings = budget.weekly - totalCost;
    suggestions.push({
      type: 'under_budget',
      message: `You're under budget by $${savings.toFixed(2)}! Consider adding healthy snacks or premium items.`,
      savings: savings
    });
  } else {
    budgetStatus = 'at';
  }

  return { items, warnings, suggestions, budgetStatus, totalCost };
};

/**
 * Generate grocery list from meal plan
 * This is the main algorithm
 */
export const generateGroceryList = async (userId, userProfile, _mealPlan = []) => {
  try {
    // Extract user preferences
    const {
      household,
      budget,
      dietary,
      shoppingPreferences,
      cookingHabits: _cookingHabits
    } = userProfile;

    // Step 1: Calculate household scaling factor
    const scalingFactor = calculateHouseholdScaling(household);

    // Step 2: Extract ingredients from meal plan
    let groceryItems = [];

    // For now, generate sample items based on user's favorite ingredients
    // In production, this would parse actual meal plan recipes
    if (dietary.favoriteIngredients) {
      const { proteins, vegetables, fruits, grains } = dietary.favoriteIngredients;

      // Add proteins
      proteins.slice(0, 3).forEach(protein => {
        groceryItems.push({
          id: `protein_${protein}`,
          name: protein.charAt(0).toUpperCase() + protein.slice(1),
          quantity: Math.round(2 * scalingFactor), // 2 lbs per person per week
          unit: 'lb',
          category: 'proteins',
          estimatedPrice: getIngredientPrice(protein, shoppingPreferences.organic === 'yes').price * 2 * scalingFactor,
          priority: 'essential',
          forMeals: ['various'],
          checked: false,
          purchased: false
        });
      });

      // Add vegetables
      vegetables.slice(0, 7).forEach(veg => {
        groceryItems.push({
          id: `veg_${veg}`,
          name: veg.charAt(0).toUpperCase() + veg.slice(1),
          quantity: Math.round(1 * scalingFactor),
          unit: 'lb',
          category: 'produce',
          estimatedPrice: getIngredientPrice(veg, shoppingPreferences.organic === 'yes').price * scalingFactor,
          priority: 'essential',
          forMeals: ['various'],
          checked: false,
          purchased: false
        });
      });

      // Add fruits
      fruits.slice(0, 4).forEach(fruit => {
        groceryItems.push({
          id: `fruit_${fruit}`,
          name: fruit.charAt(0).toUpperCase() + fruit.slice(1),
          quantity: Math.round(1.5 * scalingFactor),
          unit: 'lb',
          category: 'produce',
          estimatedPrice: getIngredientPrice(fruit, shoppingPreferences.organic === 'yes').price * 1.5 * scalingFactor,
          priority: 'essential',
          forMeals: ['snacks'],
          checked: false,
          purchased: false
        });
      });

      // Add grains
      grains.slice(0, 2).forEach(grain => {
        groceryItems.push({
          id: `grain_${grain}`,
          name: grain.charAt(0).toUpperCase() + grain.slice(1),
          quantity: 2,
          unit: 'pack',
          category: 'grains_bread',
          estimatedPrice: getIngredientPrice(grain, shoppingPreferences.organic === 'yes').price,
          priority: 'essential',
          forMeals: ['various'],
          checked: false,
          purchased: false
        });
      });
    }

    // Step 3: Add staple items based on cuisine preferences
    const staples = generateStapleItems(dietary.cuisinePreferences || []);
    groceryItems = [...groceryItems, ...staples];

    // Step 4: Filter by dietary restrictions and allergies
    groceryItems = filterByDietaryRestrictions(
      groceryItems,
      dietary.restrictions || [],
      dietary.allergies || []
    );

    // Step 5: Apply budget constraints
    const budgetResult = applyBudgetConstraints(
      groceryItems,
      budget,
      budget.priority
    );

    // Step 6: Sort items by category and priority
    groceryItems = budgetResult.items.sort((a, b) => {
      // Sort by category first
      if (a.category !== b.category) {
        const categoryOrder = ['produce', 'proteins', 'dairy', 'grains_bread', 'pantry', 'other'];
        return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      }
      // Then by priority
      const priorityOrder = { essential: 0, staple: 1, optional: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Step 7: Create grocery list document
    const groceryListData = {
      userId,
      createdAt: serverTimestamp(),
      weekStarting: new Date(),
      weekEnding: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

      metadata: {
        householdSize: household.totalMembers,
        totalEstimatedCost: budgetResult.totalCost,
        budgetLimit: budget.weekly,
        budgetStatus: budgetResult.budgetStatus,
        itemCount: groceryItems.length
      },

      items: groceryItems,
      warnings: budgetResult.warnings,
      suggestions: budgetResult.suggestions
    };

    // Step 8: Save to Firestore
    const groceryListRef = await addDoc(collection(db, 'groceryLists'), groceryListData);

    return {
      success: true,
      data: {
        id: groceryListRef.id,
        ...groceryListData
      }
    };

  } catch (error) {
    console.error('Error generating grocery list:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user's grocery lists
 */
export const getUserGroceryLists = async (userId) => {
  try {
    const q = query(
      collection(db, 'groceryLists'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const lists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, data: lists };
  } catch (error) {
    console.error('Error getting grocery lists:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update grocery list item (check/uncheck, mark purchased)
 */
export const updateGroceryItem = async (listId, itemId, updates) => {
  try {
    const listRef = doc(db, 'groceryLists', listId);
    const listDoc = await getDoc(listRef);

    if (!listDoc.exists()) {
      throw new Error('Grocery list not found');
    }

    const listData = listDoc.data();
    const updatedItems = listData.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    await updateDoc(listRef, { items: updatedItems });

    return { success: true };
  } catch (error) {
    console.error('Error updating grocery item:', error);
    return { success: false, error: error.message };
  }
};

export default {
  generateGroceryList,
  getUserGroceryLists,
  updateGroceryItem,
  calculateHouseholdScaling,
  getIngredientPrice,
  generateStapleItems
};
