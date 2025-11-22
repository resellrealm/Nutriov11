import axios from 'axios';
import {
  handleApiError
} from '../utils/errorCodes';

/**
 * Open Food Facts API Service
 * Free API for product information by barcode
 * Documentation: https://world.openfoodfacts.org/data
 */

const API_BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';

/**
 * Get product information by barcode
 */
export const getProductByBarcode = async (barcode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${barcode}.json`);

    if (response.data.status === 0) {
      return {
        success: false,
        error: 'Product not found in database'
      };
    }

    const product = response.data.product;

    // Extract nutrition information
    const nutrition = extractNutritionData(product);

    return {
      success: true,
      data: {
        name: product.product_name || product.product_name_en || 'Unknown Product',
        brand: product.brands || '',
        barcode: barcode,
        imageUrl: product.image_url || product.image_front_url || '',
        servingSize: {
          amount: parseFloat(product.serving_quantity) || 1,
          unit: product.serving_quantity_unit || 'serving'
        },
        nutrition: nutrition,
        ingredients: product.ingredients_text || '',
        categories: product.categories_tags || [],
        labels: product.labels_tags || [],
        allergens: product.allergens_tags || [],
        nutriScore: product.nutrition_grades || '',
        novaGroup: product.nova_group || null,
        ecoscore: product.ecoscore_grade || ''
      }
    };
  } catch (error) {
    console.error('Error fetching product from Open Food Facts:', error);
    return handleApiError(error);
  }
};

/**
 * Extract and normalize nutrition data
 * Open Food Facts uses various formats, this normalizes it
 */
const extractNutritionData = (product) => {
  const nutriments = product.nutriments || {};

  // Function to get value, preferring per 100g
  const getValue = (key) => {
    // Try per 100g first
    if (nutriments[`${key}_100g`] !== undefined) {
      return parseFloat(nutriments[`${key}_100g`]) || 0;
    }
    // Fall back to base value
    if (nutriments[key] !== undefined) {
      return parseFloat(nutriments[key]) || 0;
    }
    return 0;
  };

  return {
    // Energy in kcal
    calories: getValue('energy-kcal') || (getValue('energy') / 4.184) || 0,

    // Macronutrients (in grams per 100g)
    protein: getValue('proteins'),
    carbs: getValue('carbohydrates'),
    fat: getValue('fat'),

    // Additional nutrients
    fiber: getValue('fiber'),
    sugar: getValue('sugars'),
    sodium: getValue('sodium') * 1000, // Convert to mg

    // Optional additional details
    saturatedFat: getValue('saturated-fat'),
    transFat: getValue('trans-fat'),
    cholesterol: getValue('cholesterol'),
    vitaminC: getValue('vitamin-c'),
    calcium: getValue('calcium'),
    iron: getValue('iron'),
    potassium: getValue('potassium')
  };
};

/**
 * Search products by name
 */
export const searchProducts = async (searchTerm, page = 1) => {
  try {
    const response = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        search_terms: searchTerm,
        search_simple: 1,
        action: 'process',
        json: 1,
        page: page,
        page_size: 20
      }
    });

    if (response.data.count === 0) {
      return {
        success: true,
        data: [],
        count: 0
      };
    }

    const products = response.data.products.map(product => ({
      name: product.product_name || 'Unknown',
      brand: product.brands || '',
      barcode: product.code,
      imageUrl: product.image_url || product.image_small_url || '',
      categories: product.categories || '',
      nutriScore: product.nutrition_grades || ''
    }));

    return {
      success: true,
      data: products,
      count: response.data.count,
      page: response.data.page
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return handleApiError(error);
  }
};

/**
 * Get product suggestions based on categories
 */
export const getProductsByCategory = async (category) => {
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/category/${category}.json`, {
      params: {
        page_size: 20
      }
    });

    const products = (response.data.products || []).map(product => ({
      name: product.product_name || 'Unknown',
      brand: product.brands || '',
      barcode: product.code,
      imageUrl: product.image_url || '',
      nutriScore: product.nutrition_grades || ''
    }));

    return {
      success: true,
      data: products
    };
  } catch (error) {
    console.error('Error getting products by category:', error);
    return handleApiError(error);
  }
};

/**
 * Validate barcode format
 */
export const isValidBarcode = (barcode) => {
  // Remove any whitespace
  const cleaned = barcode.replace(/\s/g, '');

  // Check if it's a number
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  // Common barcode lengths: EAN-8 (8), UPC-A (12), EAN-13 (13), ITF-14 (14)
  const validLengths = [8, 12, 13, 14];

  return validLengths.includes(cleaned.length);
};

export default {
  getProductByBarcode,
  searchProducts,
  getProductsByCategory,
  isValidBarcode
};
