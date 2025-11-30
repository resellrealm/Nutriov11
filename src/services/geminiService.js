import { GoogleGenerativeAI } from '@google/generative-ai';
import { handleApiError } from '../utils/errorCodes';

/**
 * Google Gemini AI Service
 * FREE API for meal photo analysis and nutrition estimation
 *
 * Setup Instructions:
 * 1. Get free API key from: https://makersuite.google.com/app/apikey
 * 2. Add to .env file: VITE_GEMINI_API_KEY=your_api_key_here
 *
 * Rate Limits (FREE tier):
 * - 60 requests per minute
 * - 1,500 requests per day
 * - 1 million tokens per month
 */

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  return new GoogleGenerativeAI(apiKey);
};

/**
 * Analyze meal photo and extract nutrition information
 *
 * @param {string} imageBase64 - Base64 encoded image data
 * @returns {Promise<Object>} Analysis result with nutrition data
 */
export const analyzeMealPhoto = async (imageBase64) => {
  const genAI = getGeminiClient();

  // If API key not configured, return demo mode
  if (!genAI) {
    return {
      success: false,
      error: 'GEMINI_NOT_CONFIGURED',
      message: 'Gemini API key not configured. Using demo mode.',
      demoMode: true
    };
  }

  try {
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

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'QUOTA_EXCEEDED',
        message: 'Daily quota exceeded. Please try again tomorrow or upgrade to premium.'
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
  const genAI = getGeminiClient();

  if (!genAI) {
    return {
      success: false,
      error: 'GEMINI_NOT_CONFIGURED',
      message: 'Gemini API key not configured.'
    };
  }

  try {
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

  } catch (error) {
    console.error('Error generating meal suggestions:', error);
    return handleApiError(error);
  }
};

/**
 * Check if Gemini API is configured
 */
export const isGeminiConfigured = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return apiKey && apiKey !== 'your_gemini_api_key_here';
};

export default {
  analyzeMealPhoto,
  generateMealSuggestions,
  isGeminiConfigured
};
