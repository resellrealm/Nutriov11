import openFoodFactsService from './openFoodFactsService';

/**
 * Service for researching food items online to enhance AI accuracy
 * Uses multiple data sources to cross-reference nutrition information
 */
class OnlineFoodResearchService {
  /**
   * Research a food item online using multiple sources
   * @param {Object} aiResult - The AI's initial analysis
   * @returns {Promise<Object>} Enhanced result with online research
   */
  async researchFood(aiResult) {
    try {
      const { name, ingredients } = aiResult;

      // Try multiple research strategies
      const researchResults = await Promise.allSettled([
        this.searchOpenFoodFacts(name),
        this.searchCommonBrands(name),
        this.estimateFromIngredients(ingredients)
      ]);

      // Combine results to enhance confidence and accuracy
      const enhancedResult = this.crossReference(aiResult, researchResults);

      return enhancedResult;
    } catch (error) {
      console.error('Error researching food online:', error);
      // Return original result if research fails
      return {
        ...aiResult,
        onlineResearchFailed: true,
        researchError: error.message
      };
    }
  }

  /**
   * Search Open Food Facts database for matching products
   * @param {string} foodName - The food item name
   * @returns {Promise<Object|null>} Matched product data
   */
  async searchOpenFoodFacts(foodName) {
    try {
      // Search by name in Open Food Facts
      const searchResults = await openFoodFactsService.searchProductsByName(foodName);

      if (searchResults && searchResults.length > 0) {
        // Return the best match (first result)
        const bestMatch = searchResults[0];
        return {
          source: 'open_food_facts',
          confidence: this.calculateMatchConfidence(foodName, bestMatch.name),
          nutrition: bestMatch.nutrition,
          servingSize: bestMatch.servingSize,
          brand: bestMatch.brand,
          matchedName: bestMatch.name
        };
      }

      return null;
    } catch (error) {
      console.error('Open Food Facts search failed:', error);
      return null;
    }
  }

  /**
   * Search common brand databases (Greggs, McDonalds, etc.)
   * @param {string} foodName - The food item name
   * @returns {Promise<Object|null>} Brand nutrition data
   */
  async searchCommonBrands(foodName) {
    // Common UK brands database with known items
    const brandDatabase = {
      greggs: {
        'steak bake': { calories: 440, protein: 12, carbs: 45, fat: 22, fiber: 2, sugar: 3 },
        'sausage roll': { calories: 327, protein: 9.6, carbs: 25.4, fat: 20.6, fiber: 1.5, sugar: 2.1 },
        'chicken bake': { calories: 342, protein: 16, carbs: 33, fat: 15, fiber: 2, sugar: 2.5 },
        'cheese and onion bake': { calories: 278, protein: 9.5, carbs: 28.5, fat: 14, fiber: 2, sugar: 3 },
        'vegan sausage roll': { calories: 311, protein: 7.2, carbs: 29.3, fat: 17.6, fiber: 3.5, sugar: 1.9 }
      },
      mcdonalds: {
        'big mac': { calories: 563, protein: 27, carbs: 45, fat: 31, fiber: 3.5, sugar: 9 },
        'quarter pounder': { calories: 520, protein: 30, carbs: 42, fat: 26, fiber: 3, sugar: 10 },
        'chicken nuggets': { calories: 180, protein: 9, carbs: 11, fat: 11, fiber: 1, sugar: 0 },
        'fries': { calories: 337, protein: 4, carbs: 43, fat: 16, fiber: 4, sugar: 0.3 }
      },
      subway: {
        'italian bmt': { calories: 410, protein: 19, carbs: 47, fat: 16, fiber: 5, sugar: 8 },
        'chicken teriyaki': { calories: 368, protein: 25, carbs: 59, fat: 5, fiber: 5, sugar: 17 },
        'veggie delite': { calories: 230, protein: 9, carbs: 44, fat: 2.5, fiber: 5, sugar: 7 }
      },
      'costa coffee': {
        'latte': { calories: 143, protein: 8.5, carbs: 14.5, fat: 5.5, fiber: 0, sugar: 14 },
        'cappuccino': { calories: 98, protein: 6, carbs: 10, fat: 3.8, fiber: 0, sugar: 9.5 },
        'flat white': { calories: 120, protein: 7.5, carbs: 11.5, fat: 4.8, fiber: 0, sugar: 11 }
      },
      starbucks: {
        'latte': { calories: 190, protein: 12, carbs: 18, fat: 7, fiber: 0, sugar: 17 },
        'caramel macchiato': { calories: 250, protein: 10, carbs: 34, fat: 9, fiber: 0, sugar: 32 },
        'americano': { calories: 15, protein: 2, carbs: 3, fat: 0, fiber: 0, sugar: 0 }
      }
    };

    const lowerFoodName = foodName.toLowerCase();

    // Check each brand
    for (const [brand, items] of Object.entries(brandDatabase)) {
      if (lowerFoodName.includes(brand)) {
        // Found brand mention, now find the item
        for (const [itemName, nutrition] of Object.entries(items)) {
          if (lowerFoodName.includes(itemName)) {
            return {
              source: 'brand_database',
              brand: brand,
              confidence: 95, // High confidence for exact brand matches
              nutrition: {
                calories: nutrition.calories,
                protein: nutrition.protein,
                carbs: nutrition.carbs,
                fat: nutrition.fat,
                fiber: nutrition.fiber,
                sugar: nutrition.sugar,
                sodium: nutrition.sodium || 0
              },
              matchedName: `${brand} ${itemName}`
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Estimate nutrition from ingredients list
   * @param {Array} ingredients - List of detected ingredients
   * @returns {Promise<Object|null>} Estimated nutrition
   */
  async estimateFromIngredients(ingredients) {
    if (!ingredients || ingredients.length === 0) {
      return null;
    }

    try {
      // Sum up nutrition from all ingredients
      const totalNutrition = ingredients.reduce((total, ingredient) => {
        return {
          calories: total.calories + (ingredient.calories || 0),
          protein: total.protein + (ingredient.protein || 0),
          carbs: total.carbs + (ingredient.carbs || 0),
          fat: total.fat + (ingredient.fat || 0),
          fiber: total.fiber + (ingredient.fiber || 0),
          sugar: total.sugar + (ingredient.sugar || 0)
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 });

      return {
        source: 'ingredient_estimation',
        confidence: 70, // Lower confidence for estimates
        nutrition: totalNutrition
      };
    } catch (error) {
      console.error('Ingredient estimation failed:', error);
      return null;
    }
  }

  /**
   * Cross-reference AI result with online research
   * @param {Object} aiResult - Original AI analysis
   * @param {Array} researchResults - Results from various sources
   * @returns {Object} Enhanced result
   */
  crossReference(aiResult, researchResults) {
    const successfulResults = researchResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);

    if (successfulResults.length === 0) {
      // No online data found, return original with slight confidence boost for trying
      return {
        ...aiResult,
        confidence: Math.min(aiResult.confidence + 2, 100),
        onlineResearchAttempted: true,
        onlineDataFound: false
      };
    }

    // Find the highest confidence match
    const bestMatch = successfulResults.reduce((best, current) => {
      return current.confidence > best.confidence ? current : best;
    }, successfulResults[0]);

    // Calculate variance between AI and online data
    const variance = this.calculateNutritionVariance(
      aiResult.nutrition,
      bestMatch.nutrition
    );

    // If variance is low (<15%), use online data and boost confidence
    if (variance < 15) {
      return {
        ...aiResult,
        nutrition: bestMatch.nutrition,
        confidence: Math.min(aiResult.confidence + 8, 99),
        onlineResearchAttempted: true,
        onlineDataFound: true,
        onlineSource: bestMatch.source,
        matchedBrand: bestMatch.brand,
        nutritionVariance: variance,
        verifiedOnline: true
      };
    }

    // Moderate variance (15-30%), blend the data
    if (variance < 30) {
      const blendedNutrition = this.blendNutrition(
        aiResult.nutrition,
        bestMatch.nutrition
      );

      return {
        ...aiResult,
        nutrition: blendedNutrition,
        confidence: Math.min(aiResult.confidence + 5, 95),
        onlineResearchAttempted: true,
        onlineDataFound: true,
        onlineSource: bestMatch.source,
        nutritionVariance: variance,
        dataBlended: true
      };
    }

    // High variance (>30%), trust AI but flag discrepancy
    return {
      ...aiResult,
      confidence: Math.max(aiResult.confidence - 3, 60),
      onlineResearchAttempted: true,
      onlineDataFound: true,
      onlineSource: bestMatch.source,
      nutritionVariance: variance,
      discrepancyDetected: true,
      alternativeNutrition: bestMatch.nutrition
    };
  }

  /**
   * Calculate how closely a match name matches the search term
   * @param {string} searchTerm - Original search term
   * @param {string} matchName - Matched item name
   * @returns {number} Confidence score (0-100)
   */
  calculateMatchConfidence(searchTerm, matchName) {
    const searchLower = searchTerm.toLowerCase();
    const matchLower = matchName.toLowerCase();

    // Exact match
    if (searchLower === matchLower) return 100;

    // Contains exact phrase
    if (matchLower.includes(searchLower) || searchLower.includes(matchLower)) {
      return 90;
    }

    // Word overlap
    const searchWords = searchLower.split(/\s+/);
    const matchWords = matchLower.split(/\s+/);
    const overlap = searchWords.filter(word => matchWords.includes(word)).length;
    const overlapRatio = overlap / Math.max(searchWords.length, matchWords.length);

    return Math.round(overlapRatio * 80);
  }

  /**
   * Calculate variance between two nutrition objects
   * @param {Object} nutrition1 - First nutrition data
   * @param {Object} nutrition2 - Second nutrition data
   * @returns {number} Variance percentage
   */
  calculateNutritionVariance(nutrition1, nutrition2) {
    const keys = ['calories', 'protein', 'carbs', 'fat'];
    let totalVariance = 0;
    let count = 0;

    keys.forEach(key => {
      if (nutrition1[key] && nutrition2[key]) {
        const variance = Math.abs(nutrition1[key] - nutrition2[key]) / nutrition1[key] * 100;
        totalVariance += variance;
        count++;
      }
    });

    return count > 0 ? totalVariance / count : 100;
  }

  /**
   * Blend two nutrition objects (weighted average)
   * @param {Object} aiNutrition - AI-detected nutrition
   * @param {Object} onlineNutrition - Online-sourced nutrition
   * @returns {Object} Blended nutrition data
   */
  blendNutrition(aiNutrition, onlineNutrition) {
    const keys = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'];
    const blended = {};

    keys.forEach(key => {
      if (aiNutrition[key] !== undefined && onlineNutrition[key] !== undefined) {
        // 60% weight to online data, 40% to AI
        blended[key] = Math.round(
          (onlineNutrition[key] * 0.6 + aiNutrition[key] * 0.4) * 10
        ) / 10;
      } else {
        blended[key] = aiNutrition[key] || onlineNutrition[key] || 0;
      }
    });

    return blended;
  }
}

export default new OnlineFoodResearchService();
