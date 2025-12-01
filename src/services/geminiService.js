import { GoogleGenerativeAI } from '@google/generative-ai';
import { handleApiError } from '../utils/errorCodes';

/**
 * Google Gemini AI Service with Smart Failover
 * FREE API for meal photo analysis and nutrition estimation
 *
 * Setup Instructions:
 * 1. Get 3 free API keys from: https://makersuite.google.com/app/apikey
 * 2. Add to .env file:
 *    VITE_GEMINI_API_KEY=your_first_key
 *    VITE_GEMINI_API_KEY_2=your_second_key
 *    VITE_GEMINI_API_KEY_3=your_third_key
 *
 * Rate Limits PER KEY (FREE tier):
 * - 60 requests per minute
 * - 1,500 requests per day
 * - 1 million tokens per month
 *
 * With 3 keys: 4,500 requests/day, 3M tokens/month total capacity
 *
 * Smart Failover:
 * - Primary key used by default
 * - If rate limited, automatically switches to backup keys
 * - Rate-limited keys enter 24-hour cooldown
 * - Cooldown tracked in memory (resets on server restart)
 */

// API Key Manager with Smart Failover
class GeminiKeyManager {
  constructor() {
    // Load all available API keys from env
    this.keys = [
      import.meta.env.VITE_GEMINI_API_KEY,
      import.meta.env.VITE_GEMINI_API_KEY_2,
      import.meta.env.VITE_GEMINI_API_KEY_3,
    ].filter(key => key && key !== 'your_gemini_api_key_here');

    // Track cooldown status: { keyIndex: cooldownUntilTimestamp }
    this.cooldowns = {};

    console.log(`[Gemini] Initialized with ${this.keys.length} API key(s)`);
  }

  /**
   * Get the next available API key
   * @returns {string|null} Available API key or null
   */
  getAvailableKey() {
    const now = Date.now();

    for (let i = 0; i < this.keys.length; i++) {
      // Check if key is in cooldown
      if (this.cooldowns[i] && this.cooldowns[i] > now) {
        const remainingMin = Math.ceil((this.cooldowns[i] - now) / 1000 / 60);
        console.log(`[Gemini] Key ${i + 1} in cooldown (${remainingMin} min remaining)`);
        continue;
      }

      // Key is available
      console.log(`[Gemini] Using API key ${i + 1}`);
      return { key: this.keys[i], index: i };
    }

    return null;
  }

  /**
   * Mark a key as rate limited (24-hour cooldown)
   * @param {number} keyIndex - Index of the rate-limited key
   */
  markKeyAsRateLimited(keyIndex) {
    // Set cooldown for 24 hours (daily rate limit resets)
    const cooldownUntil = Date.now() + (24 * 60 * 60 * 1000);
    this.cooldowns[keyIndex] = cooldownUntil;

    const resetTime = new Date(cooldownUntil).toLocaleTimeString();
    console.warn(`[Gemini] ⚠️ Key ${keyIndex + 1} rate limited. Cooldown until ${resetTime}`);
  }

  /**
   * Check if any keys are available
   * @returns {boolean}
   */
  hasAvailableKeys() {
    const now = Date.now();
    return this.keys.some((_, i) => !this.cooldowns[i] || this.cooldowns[i] <= now);
  }

  /**
   * Get total number of configured keys
   * @returns {number}
   */
  getTotalKeys() {
    return this.keys.length;
  }
}

// Initialize key manager (singleton)
const keyManager = new GeminiKeyManager();

/**
 * Get Gemini client with smart failover
 * Automatically tries backup keys if primary is rate limited
 *
 * @returns {Object|null} { client: GoogleGenerativeAI, keyIndex: number } or null
 */
const getGeminiClient = () => {
  const keyInfo = keyManager.getAvailableKey();

  if (!keyInfo) {
    console.error('[Gemini] No available API keys');
    return null;
  }

  const client = new GoogleGenerativeAI(keyInfo.key);
  return { client, keyIndex: keyInfo.index };
};

/**
 * Check if an error is a rate limit error
 * @param {Error} error - Error object
 * @returns {boolean}
 */
const isRateLimitError = (error) => {
  const errorStr = error.toString().toLowerCase();
  const message = error.message?.toLowerCase() || '';

  return (
    errorStr.includes('429') ||
    errorStr.includes('quota') ||
    errorStr.includes('rate limit') ||
    errorStr.includes('resource exhausted') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('429')
  );
};

/**
 * Execute Gemini API call with smart failover
 * Automatically retries with backup keys if rate limited
 *
 * @param {Function} apiCall - Async function that makes the API call
 * @returns {Promise<any>} API call result
 */
const executeWithFailover = async (apiCall) => {
  let lastError = null;
  const maxAttempts = keyManager.getTotalKeys();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const clientInfo = getGeminiClient();

    if (!clientInfo) {
      // No keys available
      return {
        success: false,
        error: 'ALL_KEYS_RATE_LIMITED',
        message: 'All API keys are rate limited. Please try again later.',
      };
    }

    try {
      // Attempt API call with current key
      const result = await apiCall(clientInfo.client);
      return result;

    } catch (error) {
      lastError = error;

      // Check if it's a rate limit error
      if (isRateLimitError(error)) {
        console.warn(`[Gemini] Rate limit hit on key ${clientInfo.keyIndex + 1}, trying next key...`);
        keyManager.markKeyAsRateLimited(clientInfo.keyIndex);

        // Continue to next iteration to try another key
        continue;
      }

      // If it's not a rate limit error, throw immediately
      throw error;
    }
  }

  // All keys exhausted
  console.error('[Gemini] All API keys exhausted');
  return {
    success: false,
    error: 'ALL_KEYS_RATE_LIMITED',
    message: `All ${maxAttempts} API keys are rate limited. Please try again in 24 hours.`,
  };
};

/**
 * Analyze meal photo and extract nutrition information
 *
 * @param {string} imageBase64 - Base64 encoded image data
 * @returns {Promise<Object>} Analysis result with nutrition data
 */
export const analyzeMealPhoto = async (imageBase64) => {
  // Check if any keys are configured
  if (keyManager.getTotalKeys() === 0) {
    return {
      success: false,
      error: 'GEMINI_NOT_CONFIGURED',
      message: 'Gemini API key not configured. Using demo mode.',
      demoMode: true
    };
  }

  try {
    return await executeWithFailover(async (genAI) => {
      // Use Gemini Pro Vision model for image analysis
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Prepare the prompt for nutrition analysis
      const prompt = `Analyze this food image and provide detailed nutrition information.

Please respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks, just raw JSON):

{
  "name": "Name of the dish or meal",
  "confidence": 85,
  "totalWeight": 350,
  "nutrition": {
    "calories": 450,
    "protein": 35,
    "carbs": 45,
    "fat": 12,
    "fiber": 8,
    "sugar": 5,
    "sodium": 450
  },
  "ingredients": [
    {"name": "Grilled chicken breast", "amount": "150g", "calories": 165},
    {"name": "Brown rice", "amount": "100g", "calories": 110},
    {"name": "Mixed vegetables", "amount": "100g", "calories": 50}
  ],
  "suggestions": [
    {"text": "Great protein content!", "type": "positive"},
    {"text": "Consider adding more healthy fats like avocado", "type": "improve"}
  ],
  "healthScore": 85,
  "mealType": "lunch"
}

Rules:
- Be as accurate as possible with portion sizes and nutrition
- Include all visible ingredients
- Provide actionable suggestions
- healthScore: 0-100 (higher is healthier)
- mealType: breakfast, lunch, dinner, or snack
- confidence: 0-100 (how confident you are in the analysis)`;

      // Remove data URL prefix if present
      const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      // Generate content with image and prompt
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageData
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      let analysis;
      try {
        // Try to extract JSON from the response (in case there's extra text)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          analysis = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text);
        throw new Error('Invalid response format from AI');
      }

      // Validate required fields
      if (!analysis.name || !analysis.nutrition) {
        throw new Error('Incomplete analysis data');
      }

      return {
        success: true,
        data: {
          name: analysis.name,
          confidence: analysis.confidence || 75,
          totalWeight: analysis.totalWeight || 0,
          nutrition: {
            calories: Math.round(analysis.nutrition.calories || 0),
            protein: Math.round(analysis.nutrition.protein || 0),
            carbs: Math.round(analysis.nutrition.carbs || 0),
            fat: Math.round(analysis.nutrition.fat || 0),
            fiber: Math.round(analysis.nutrition.fiber || 0),
            sugar: Math.round(analysis.nutrition.sugar || 0),
            sodium: Math.round(analysis.nutrition.sodium || 0)
          },
          ingredients: analysis.ingredients || [],
          suggestions: analysis.suggestions || [],
          healthScore: analysis.healthScore || 70,
          mealType: analysis.mealType || 'snack'
        }
      };
    });

  } catch (error) {
    console.error('Error analyzing meal with Gemini:', error);

    // Handle specific error cases
    if (error.message?.includes('API_KEY')) {
      return {
        success: false,
        error: 'INVALID_API_KEY',
        message: 'Invalid Gemini API key. Please check your configuration.'
      };
    }

    return handleApiError(error);
  }
};

/**
 * Generate meal suggestions based on nutritional goals
 *
 * @param {Object} userGoals - User's nutritional goals
 * @param {Object} currentIntake - Current day's intake
 * @returns {Promise<Object>} Meal suggestions
 */
export const generateMealSuggestions = async (userGoals, currentIntake) => {
  if (keyManager.getTotalKeys() === 0) {
    return {
      success: false,
      error: 'GEMINI_NOT_CONFIGURED',
      message: 'Gemini API key not configured.'
    };
  }

  try {
    return await executeWithFailover(async (genAI) => {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Based on these nutritional goals and current intake, suggest 3 meals.

Goals: ${JSON.stringify(userGoals)}
Current Intake: ${JSON.stringify(currentIntake)}

Respond ONLY with valid JSON (no markdown):

{
  "meals": [
    {
      "name": "Grilled Salmon with Quinoa",
      "calories": 450,
      "protein": 35,
      "carbs": 40,
      "fat": 15,
      "reason": "High in protein and omega-3 fatty acids"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

      return {
        success: true,
        data: suggestions.meals || []
      };
    });

  } catch (error) {
    console.error('Error generating meal suggestions:', error);
    return handleApiError(error);
  }
};

/**
 * Analyze fridge/cupboard photo and detect ingredients
 *
 * @param {string} imageBase64 - Base64 encoded image data
 * @returns {Promise<Object>} Result with detected ingredients
 */
export const analyzeFridgePhoto = async (imageBase64) => {
  if (keyManager.getTotalKeys() === 0) {
    return {
      success: false,
      error: 'GEMINI_NOT_CONFIGURED',
      message: 'Gemini API key not configured. Using demo mode.',
      demoMode: true
    };
  }

  try {
    return await executeWithFailover(async (genAI) => {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analyze this fridge/cupboard photo and identify all visible food ingredients.

Respond ONLY with valid JSON (no markdown, no code blocks):

{
  "ingredients": [
    {"name": "Eggs", "quantity": "12", "category": "proteins", "freshness": "fresh"},
    {"name": "Milk", "quantity": "1 carton", "category": "dairy", "freshness": "fresh"},
    {"name": "Broccoli", "quantity": "1 bunch", "category": "produce", "freshness": "fresh"}
  ],
  "confidence": 85
}

Categories: produce, proteins, dairy, grains_bread, pantry, frozen, snacks, beverages, condiments
Freshness: fresh, moderate, questionable`;

      const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageData
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

      return {
        success: true,
        data: {
          ingredients: data.ingredients || [],
          confidence: data.confidence || 75
        }
      };
    });

  } catch (error) {
    console.error('Error analyzing fridge photo:', error);
    return handleApiError(error);
  }
};

/**
 * Generate meal suggestions based on available ingredients and user goals
 *
 * @param {Array} ingredients - List of available ingredients
 * @param {Object} userGoals - User's nutrition goals
 * @param {string} mealType - breakfast, lunch, dinner, snack
 * @param {string} difficulty - easy, medium, hard
 * @returns {Promise<Object>} Result with meal suggestions
 */
export const generateMealSuggestionsFromIngredients = async (ingredients, userGoals, mealType, difficulty) => {
  if (keyManager.getTotalKeys() === 0) {
    return {
      success: false,
      error: 'GEMINI_NOT_CONFIGURED',
      demoMode: true
    };
  }

  try {
    return await executeWithFailover(async (genAI) => {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const ingredientsList = ingredients.map(i => i.name || i).join(', ');
      const goalText = userGoals ?
        `Target: ${userGoals.calories}cal, ${userGoals.protein}g protein, ${userGoals.carbs}g carbs, ${userGoals.fats}g fat` :
        'Balanced nutrition';

      const difficultyTime = {
        easy: '< 20 minutes',
        medium: '20-40 minutes',
        hard: '40+ minutes'
      }[difficulty] || '< 30 minutes';

      const prompt = `Generate 3-5 ${mealType} recipe suggestions using these ingredients: ${ingredientsList}

User's nutrition goals: ${goalText}
Difficulty: ${difficulty} (${difficultyTime})

Respond ONLY with valid JSON (no markdown):

{
  "meals": [
    {
      "id": 1,
      "name": "Avocado Toast with Poached Egg",
      "description": "Whole grain toast topped with mashed avocado and poached egg",
      "cookTime": "15 min",
      "difficulty": "Easy",
      "calories": 380,
      "protein": 18,
      "carbs": 35,
      "fat": 20,
      "fiber": 8,
      "ingredients": ["Bread", "Avocado", "Eggs"],
      "matchScore": 95,
      "instructions": ["Toast bread", "Mash avocado", "Poach egg", "Assemble"],
      "reason": "High protein, healthy fats, fits calorie goal"
    }
  ]
}

Rules:
- Use ONLY ingredients from the provided list (maximize usage)
- Match the user's nutrition goals as closely as possible
- Match the difficulty level
- Provide cook time estimate
- Calculate matchScore (% of ingredients from user's list, 0-100)
- Include clear instructions (array of steps)
- Explain why this meal is good for the user`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

      return {
        success: true,
        data: data.meals || []
      };
    });

  } catch (error) {
    console.error('Error generating meal suggestions:', error);
    return handleApiError(error);
  }
};

/**
 * Check if Gemini API is configured
 * @returns {boolean} True if at least one API key is configured
 */
export const isGeminiConfigured = () => {
  return keyManager.getTotalKeys() > 0;
};

/**
 * Get Gemini API key status
 * @returns {Object} Status information about configured keys
 */
export const getGeminiStatus = () => {
  const totalKeys = keyManager.getTotalKeys();
  const now = Date.now();
  const availableKeys = keyManager.keys.filter((_, i) =>
    !keyManager.cooldowns[i] || keyManager.cooldowns[i] <= now
  ).length;

  return {
    totalKeys,
    availableKeys,
    configured: totalKeys > 0,
    allRateLimited: totalKeys > 0 && availableKeys === 0
  };
};

export default {
  analyzeMealPhoto,
  generateMealSuggestions,
  analyzeFridgePhoto,
  generateMealSuggestionsFromIngredients,
  isGeminiConfigured,
  getGeminiStatus
};
