import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Users, ChefHat, Flame, Apple, Heart,
  Share2, Printer, BookmarkPlus, BookmarkCheck, Loader, AlertCircle,
  TrendingUp, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getRecipeById } from '../services/recipeService';

const RecipeDetails = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const userId = useSelector(state => state.auth.user?.id);

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real app, you would fetch from your recipe service
        // For now, we'll use mock data or fetch from the recipe service
        const result = await getRecipeById(recipeId);

        if (result.success) {
          setRecipe(result.data);
          setServings(result.data.servings || 1);
        } else {
          setError('Recipe not found');
        }
      } catch (err) {
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  const handleSaveRecipe = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Recipe removed from favorites' : 'Recipe saved to favorites!');
  };

  const handleShare = async () => {
    if (navigator.share && recipe) {
      try {
        await navigator.share({
          title: recipe.name,
          text: recipe.description,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or share failed
        if (err.name !== 'AbortError') {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard!');
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateScaledNutrition = (value) => {
    if (!recipe || !value) return 0;
    const scale = servings / recipe.servings;
    return Math.round(value * scale);
  };

  const calculateScaledIngredient = (ingredient) => {
    // This is a simple implementation - a more complex one would parse amounts
    return ingredient;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Recipe Not Found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The recipe you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Hard': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      {/* Recipe Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden mb-6"
      >
        {/* Recipe Image */}
        {recipe.imageUrl && (
          <div className="w-full h-64 md:h-96 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
            <span className="text-8xl">{recipe.image || '🍽️'}</span>
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Title and Actions */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {recipe.name}
              </h1>
              {recipe.description && (
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {recipe.description}
                </p>
              )}
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={handleSaveRecipe}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
              >
                {isSaved ? (
                  <BookmarkCheck className="text-primary" size={20} />
                ) : (
                  <BookmarkPlus className="text-gray-600 dark:text-gray-400" size={20} />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                title="Share recipe"
              >
                <Share2 className="text-gray-600 dark:text-gray-400" size={20} />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition print:hidden"
                title="Print recipe"
              >
                <Printer className="text-gray-600 dark:text-gray-400" size={20} />
              </button>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {recipe.prepTime && (
              <div className="flex items-center space-x-2">
                <Clock className="text-primary" size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Prep Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{recipe.prepTime}</p>
                </div>
              </div>
            )}
            {recipe.cookTime && (
              <div className="flex items-center space-x-2">
                <Flame className="text-orange-500" size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cook Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{recipe.cookTime}</p>
                </div>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center space-x-2">
                <Users className="text-emerald-500" size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Servings</p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                    >
                      -
                    </button>
                    <p className="font-semibold text-gray-900 dark:text-white">{servings}</p>
                    <button
                      onClick={() => setServings(servings + 1)}
                      className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
            {recipe.difficulty && (
              <div className="flex items-center space-x-2">
                <ChefHat className="text-purple-500" size={20} />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Difficulty</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${difficultyColors[recipe.difficulty]}`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Nutrition Info */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="mr-2 text-primary" size={20} />
              Nutrition Information (per serving)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {calculateScaledNutrition(recipe.calories)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {calculateScaledNutrition(recipe.protein)}g
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {calculateScaledNutrition(recipe.carbs)}g
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {calculateScaledNutrition(recipe.fat)}g
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fat</p>
              </div>
            </div>
            {recipe.fiber && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {calculateScaledNutrition(recipe.fiber)}g
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Fiber</p>
                  </div>
                  {recipe.sugar && (
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {calculateScaledNutrition(recipe.sugar)}g
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Sugar</p>
                    </div>
                  )}
                  {recipe.sodium && (
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {calculateScaledNutrition(recipe.sodium)}mg
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Sodium</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Ingredients and Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Apple className="mr-2 text-primary" size={24} />
              Ingredients
            </h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="inline-block w-5 h-5 rounded-full bg-primary/20 flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <span className="text-primary text-xs">✓</span>
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {calculateScaledIngredient(ingredient)}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <ChefHat className="mr-2 text-primary" size={24} />
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start space-x-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 pt-1">
                    {instruction}
                  </p>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetails;
