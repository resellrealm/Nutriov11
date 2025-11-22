import axios from 'axios';

// Constants
const FREE_SCAN_LIMIT = 5;
const API_TIMEOUT = 30000;
const MAX_RETRIES = 2;

// API Configuration - Use environment variables
export const API_CONFIG = {
  NUTRITIONIX: {
    APP_ID: import.meta.env.VITE_NUTRITIONIX_APP_ID || '',
    APP_KEY: import.meta.env.VITE_NUTRITIONIX_APP_KEY || '',
    BASE_URL: 'https://trackapi.nutritionix.com/v2',
  },
  SPOONACULAR: {
    API_KEY: import.meta.env.VITE_SPOONACULAR_API_KEY || '',
    BASE_URL: 'https://api.spoonacular.com',
  },
};

// Safe localStorage helper
const safeLocalStorage = {
  getItem: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      return localStorage.getItem(key) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, value);
    } catch {
      // Storage quota exceeded or private browsing
    }
  },
  getNumber: (key, defaultValue = 0) => {
    const value = parseInt(safeLocalStorage.getItem(key, String(defaultValue)), 10);
    return isNaN(value) ? defaultValue : value;
  }
};

// Nutritionix API - Image food recognition
export const analyzeFoodImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await axios.post(
      `${API_CONFIG.NUTRITIONIX.BASE_URL}/natural/nutrients`,
      formData,
      {
        headers: {
          'x-app-id': API_CONFIG.NUTRITIONIX.APP_ID,
          'x-app-key': API_CONFIG.NUTRITIONIX.APP_KEY,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return {
      success: true,
      data: response.data.foods[0], // Returns nutrition data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to analyze food image',
      statusCode: error.response?.status,
    };
  }
};

// Nutritionix API - Natural language food search
export const searchFood = async (query) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.NUTRITIONIX.BASE_URL}/natural/nutrients`,
      {
        query: query,
      },
      {
        headers: {
          'x-app-id': API_CONFIG.NUTRITIONIX.APP_ID,
          'x-app-key': API_CONFIG.NUTRITIONIX.APP_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      success: true,
      data: response.data.foods,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to search food',
      statusCode: error.response?.status,
    };
  }
};

// Spoonacular API - Get recipe recommendations
export const getRecipeRecommendations = async (diet, intolerances = []) => {
  try {
    const params = new URLSearchParams({
      apiKey: API_CONFIG.SPOONACULAR.API_KEY,
      number: 10,
      diet: diet || '',
      intolerances: intolerances.join(','),
    });
    
    const response = await axios.get(
      `${API_CONFIG.SPOONACULAR.BASE_URL}/recipes/complexSearch?${params}`
    );
    
    return {
      success: true,
      data: response.data.results,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get recipe recommendations',
      statusCode: error.response?.status,
    };
  }
};

// Spoonacular API - Search recipes by ingredients
export const searchRecipesByIngredients = async (ingredients) => {
  try {
    const params = new URLSearchParams({
      apiKey: API_CONFIG.SPOONACULAR.API_KEY,
      ingredients: ingredients.join(','),
      number: 10,
      ranking: 2, // Maximize used ingredients
    });
    
    const response = await axios.get(
      `${API_CONFIG.SPOONACULAR.BASE_URL}/recipes/findByIngredients?${params}`
    );
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to search recipes',
      statusCode: error.response?.status,
    };
  }
};

// Mock data for development (when API keys not set)
export const getMockFoodData = (foodName) => {
  return {
    success: true,
    data: {
      food_name: foodName || 'Grilled Chicken Salad',
      serving_qty: 1,
      serving_weight_grams: 250,
      nf_calories: 385,
      nf_total_fat: 16,
      nf_saturated_fat: 3,
      nf_cholesterol: 95,
      nf_sodium: 450,
      nf_total_carbohydrate: 18,
      nf_dietary_fiber: 6,
      nf_sugars: 8,
      nf_protein: 42,
      nf_potassium: 850,
      photo: {
        thumb: 'https://nutritionix-api.s3.amazonaws.com/5e51f1a7d3dd7f5f6f5cb3c1.jpg',
      },
    },
  };
};

// Helper to check if user has premium subscription
export const hasPremiumAccess = () => {
  const subscription = safeLocalStorage.getItem('subscriptionTier');
  return subscription === 'premium';
};

// Helper to check scan limit
export const canUserScan = () => {
  if (hasPremiumAccess()) return { allowed: true };

  const scansThisMonth = safeLocalStorage.getNumber('scansThisMonth', 0);

  return {
    allowed: scansThisMonth < FREE_SCAN_LIMIT,
    remaining: Math.max(0, FREE_SCAN_LIMIT - scansThisMonth),
    limit: FREE_SCAN_LIMIT,
  };
};

// Increment scan count
export const incrementScanCount = () => {
  const scansThisMonth = safeLocalStorage.getNumber('scansThisMonth', 0);
  safeLocalStorage.setItem('scansThisMonth', (scansThisMonth + 1).toString());

  // Set month to reset counter
  const currentMonth = new Date().getMonth();
  safeLocalStorage.setItem('scanCountMonth', currentMonth.toString());
};

// Reset scan count if new month
export const checkAndResetScanCount = () => {
  const currentMonth = new Date().getMonth();
  const savedMonth = safeLocalStorage.getNumber('scanCountMonth', currentMonth);

  if (currentMonth !== savedMonth) {
    safeLocalStorage.setItem('scansThisMonth', '0');
    safeLocalStorage.setItem('scanCountMonth', currentMonth.toString());
  }
};

// Format nutrition data for display
export const formatNutritionData = (data) => {
  return {
    name: data.food_name || data.name,
    calories: Math.round(data.nf_calories || data.calories || 0),
    protein: Math.round(data.nf_protein || data.protein || 0),
    carbs: Math.round(data.nf_total_carbohydrate || data.carbs || 0),
    fats: Math.round(data.nf_total_fat || data.fats || 0),
    fiber: Math.round(data.nf_dietary_fiber || data.fiber || 0),
    servingSize: data.serving_weight_grams || 100,
    image: data.photo?.thumb || data.image || null,
  };
};
