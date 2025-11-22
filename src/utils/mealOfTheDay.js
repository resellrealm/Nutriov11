// Re-export from recipe service for backward compatibility
import { BUILT_IN_RECIPES, getMealOfTheDay, getMealForDate } from '../services/recipeService';

// Export DAILY_MEALS as alias for backward compatibility
export const DAILY_MEALS = BUILT_IN_RECIPES;

export { getMealOfTheDay, getMealForDate };
