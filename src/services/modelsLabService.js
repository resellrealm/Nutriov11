/**
 * ModelsLab AI Service
 * Integration with ModelsLab APIs for image analysis and generation
 */

const MODELSLAB_API_KEY = import.meta.env.VITE_MODELSLAB_API_KEY;
const MODELSLAB_BASE_URL = 'https://modelslab.com/api/v6';

/**
 * Analyze food image and detect items
 */
export const analyzeFoodImage = async (imageBase64OrUrl) => {
  try {
    const response = await fetch(`${MODELSLAB_BASE_URL}/images/img2text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        image: imageBase64OrUrl,
        prompt: 'List all visible food items in this image with estimated portions',
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      return {
        success: true,
        description: data.output,
        detectedItems: parseDetectedFoods(data.output),
      };
    }

    return {
      success: false,
      error: data.message || 'Failed to analyze image',
    };
  } catch (error) {
    console.error('ModelsLab API error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate recipe image
 */
export const generateRecipeImage = async (recipeName, style = 'professional') => {
  try {
    const stylePrompts = {
      professional: 'professional food photography, studio lighting, high quality',
      rustic: 'rustic food photography, natural lighting, wooden table',
      modern: 'modern minimalist food photography, clean background',
    };

    const response = await fetch(`${MODELSLAB_BASE_URL}/realtime/text2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        prompt: `${recipeName}, ${stylePrompts[style]}, appetizing, detailed`,
        negative_prompt: 'blurry, low quality, unappetizing, messy',
        width: 512,
        height: 512,
        samples: 1,
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      return {
        success: true,
        imageUrl: data.output[0],
      };
    }

    return {
      success: false,
      error: data.message || 'Failed to generate image',
    };
  } catch (error) {
    console.error('ModelsLab image generation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Remove background from food image (for clean product shots)
 */
export const removeBackground = async (imageUrl) => {
  try {
    const response = await fetch(`${MODELSLAB_BASE_URL}/images/removebg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        image: imageUrl,
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      return {
        success: true,
        imageUrl: data.output,
      };
    }

    return {
      success: false,
      error: data.message || 'Failed to remove background',
    };
  } catch (error) {
    console.error('ModelsLab background removal error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upscale food image for better quality
 */
export const upscaleImage = async (imageUrl, scale = 2) => {
  try {
    const response = await fetch(`${MODELSLAB_BASE_URL}/images/super_resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        image: imageUrl,
        scale: scale, // 2x or 4x
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      return {
        success: true,
        imageUrl: data.output,
      };
    }

    return {
      success: false,
      error: data.message || 'Failed to upscale image',
    };
  } catch (error) {
    console.error('ModelsLab upscale error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Helper: Parse detected foods from description
 */
const parseDetectedFoods = (description) => {
  // Basic parsing - would need refinement
  const items = [];
  const lines = description.split('\n');

  lines.forEach(line => {
    if (line.trim()) {
      items.push(line.trim());
    }
  });

  return items;
};

/**
 * Batch generate images for all recipes
 */
export const batchGenerateRecipeImages = async (recipes) => {
  const results = [];

  for (const recipe of recipes) {
    const result = await generateRecipeImage(recipe.name);

    if (result.success) {
      results.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        imageUrl: result.imageUrl,
      });
    }

    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
};

export default {
  analyzeFoodImage,
  generateRecipeImage,
  removeBackground,
  upscaleImage,
  batchGenerateRecipeImages,
};
