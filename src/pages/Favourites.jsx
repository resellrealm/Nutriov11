import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Book,
  Utensils,
  Calendar,
  Plus,
  Search,
  Edit,
  Clock,
  Star,
  Link2,
  Camera,
  Upload,
  X,
  Save,
  Share2,
  Timer,
  ShoppingCart,
  TrendingUp,
  BookOpen,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  saveUserRecipe,
  markRecipeCooked,
  getAllUserAndBuiltInRecipes,
  BUILT_IN_RECIPES
} from '../services/recipeService';
import { logFoodItem } from '../services/foodLogService';
import { logError } from '../utils/errorLogger';

const Favourites = () => {
  const user = useSelector(state => state.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('favourites');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [addMethod, setAddMethod] = useState('scan'); // scan, link, manual
  const [loading, setLoading] = useState(true);

  // Real data from Firestore
  const [userRecipes, setUserRecipes] = useState([]);
  const [favourites, setFavourites] = useState([]);

  const loadRecipes = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const result = await getAllUserAndBuiltInRecipes(user.uid);

      if (result.success) {
        setUserRecipes(result.data.custom);
        // Combine built-in and custom recipes
        setFavourites([...result.data.custom, ...result.data.builtIn.slice(0, 10)]); // Show 10 built-in recipes
      }
    } catch (error) {
      logError('Favourites.loadRecipes', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const tabs = [
    { id: 'favourites', name: 'All Recipes', icon: Heart, count: favourites.length },
    { id: 'custom', name: 'My Recipes', icon: Book, count: userRecipes.length },
    { id: 'builtin', name: 'Discover', icon: Utensils, count: BUILT_IN_RECIPES.length }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: Utensils },
    { id: 'breakfast', name: 'Breakfast', icon: "☕" },
    { id: 'lunch', name: 'Lunch', icon: "🥗" },
    { id: 'dinner', name: 'Dinner', icon: "🍽️" },
    { id: 'snack', name: 'Snacks', icon: "🍿" }
  ];

  // Enhanced filter with better search logic
  const getFilteredRecipes = () => {
    let recipesToFilter = favourites;

    if (activeTab === 'custom') {
      recipesToFilter = userRecipes;
    } else if (activeTab === 'builtin') {
      recipesToFilter = BUILT_IN_RECIPES;
    }

    return recipesToFilter.filter(item => {
      // Improved search
      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      const matchesSearch = searchQuery === '' || searchTerms.every(term =>
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.tags?.some(tag => tag.toLowerCase().includes(term)) ||
        item.mealType?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.difficulty?.toLowerCase().includes(term) ||
        item.cookbook?.toLowerCase().includes(term)
      );

      const matchesFilter =
        selectedFilter === 'all' || item.mealType === selectedFilter || item.category === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  };

  const filteredFavourites = getFilteredRecipes();

  const handleAddToToday = async (recipe) => {
    try {
      const foodData = {
        name: recipe.name,
        date: new Date().toISOString().split('T')[0],
        mealType: recipe.mealType || recipe.category || 'lunch',
        source: 'recipe',

        food: {
          name: recipe.name,
          brand: recipe.cookbook || '',
          nutrition: {
            calories: recipe.calories || 0,
            protein: recipe.protein || 0,
            carbs: recipe.carbs || 0,
            fat: recipe.fat || 0,
            fiber: recipe.fiber || 0
          },
          servingsConsumed: 1
        }
      };

      const result = await logFoodItem(user.uid, foodData);

      if (result.success) {
        toast.success(`${recipe.name} added to today's log! 🍽️`);

        // Mark recipe as cooked if it's a user recipe
        if (recipe.id && !recipe.id.startsWith('recipe_')) {
          await markRecipeCooked(user.uid, recipe.id);
          loadRecipes(); // Reload to update counts
        }
      } else {
        toast.error(result.error || 'Failed to add to food log');
      }
    } catch (error) {
      logError('Favourites.handleAddToToday', error);
      toast.error('Failed to add recipe to food log');
    }
  };

  const handleSaveRecipe = async (recipeData) => {
    try {
      const result = await saveUserRecipe(user.uid, recipeData);

      if (result.success) {
        toast.success('Recipe saved successfully! 📖');
        setShowAddModal(false);
        loadRecipes();
      } else {
        toast.error(result.error || 'Failed to save recipe');
      }
    } catch (error) {
      logError('Favourites.handleSaveRecipe', error);
      toast.error('Failed to save recipe');
    }
  };

  const RecipeCard = ({ recipe }) => {
    const isBuiltIn = recipe.id?.startsWith('recipe_');

    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => setSelectedRecipe(recipe)}
      >
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20">
          {recipe.image && typeof recipe.image === 'string' && recipe.image.startsWith('http') ? (
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {recipe.image || '🍽️'}
            </div>
          )}
          {recipe.rating > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
              <Star className="text-yellow-500 fill-yellow-500" size={14} />
              <span className="text-sm font-semibold">{recipe.rating}</span>
            </div>
          )}
          {(recipe.source === 'cookbook' || recipe.cookbook) && (
            <div className="absolute top-3 left-3 bg-primary/90 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
              <Book size={14} />
              <span className="text-xs">Cookbook</span>
            </div>
          )}
          {isBuiltIn && (
            <div className="absolute top-3 left-3 bg-accent/90 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
              <Utensils size={14} />
              <span className="text-xs">Built-in</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{recipe.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{recipe.description}</p>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Clock size={14} className="mr-1" />
                {recipe.cookTime}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                {recipe.difficulty}
              </span>
            </div>
            {recipe.timesCooked > 0 && (
              <div className="flex items-center space-x-2">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs">{recipe.timesCooked}x cooked</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {recipe.calories} cal
              </div>
              <div className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                {recipe.protein}g protein
              </div>
            </div>
            {recipe.lastMade && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{recipe.lastMade}</p>
            )}
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const AddRecipeModal = () => {
    const [recipeData, setRecipeData] = useState({
      name: '',
      description: '',
      url: '',
      ingredients: '',
      instructions: '',
      servings: 4,
      cookTime: '',
      difficulty: 'Medium',
      mealType: 'lunch',
      calories: '',
      protein: '',
      carbs: '',
      fats: ''
    });

    const handleSubmit = () => {
      if (!recipeData.name) {
        toast.error('Please enter a recipe name');
        return;
      }

      const ingredientsArray = recipeData.ingredients
        .split('\n')
        .filter(i => i.trim())
        .map(i => i.trim());

      const recipeToSave = {
        name: recipeData.name,
        description: recipeData.description,
        mealType: recipeData.mealType,
        cookTime: recipeData.cookTime || '30 min',
        difficulty: recipeData.difficulty,
        servings: parseInt(recipeData.servings) || 4,
        source: addMethod,
        url: addMethod === 'link' ? recipeData.url : null,
        ingredients: ingredientsArray,
        instructions: recipeData.instructions,
        calories: parseInt(recipeData.calories) || 0,
        protein: parseInt(recipeData.protein) || 0,
        carbs: parseInt(recipeData.carbs) || 0,
        fat: parseInt(recipeData.fats) || 0,
        tags: []
      };

      handleSaveRecipe(recipeToSave);
    };

    return (
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Add Recipe</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Method Selection */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">How would you like to add?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'scan', name: 'Scan Cookbook', icon: Camera },
                      { id: 'link', name: 'Import from URL', icon: Link2 },
                      { id: 'manual', name: 'Manual Entry', icon: Edit }
                    ].map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setAddMethod(method.id)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            addMethod === method.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <Icon className={`mx-auto mb-2 ${
                            addMethod === method.id ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                          }`} size={24} />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Manual Entry */}
                {addMethod === 'manual' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Recipe Name *</label>
                      <input
                        type="text"
                        value={recipeData.name}
                        onChange={(e) => setRecipeData({ ...recipeData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                      <textarea
                        rows="2"
                        value={recipeData.description}
                        onChange={(e) => setRecipeData({ ...recipeData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Meal Type</label>
                        <select
                          value={recipeData.mealType}
                          onChange={(e) => setRecipeData({ ...recipeData, mealType: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Servings</label>
                        <input
                          type="number"
                          value={recipeData.servings}
                          onChange={(e) => setRecipeData({ ...recipeData, servings: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Cook Time</label>
                        <input
                          type="text"
                          placeholder="30 min"
                          value={recipeData.cookTime}
                          onChange={(e) => setRecipeData({ ...recipeData, cookTime: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Difficulty</label>
                        <select
                          value={recipeData.difficulty}
                          onChange={(e) => setRecipeData({ ...recipeData, difficulty: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Calories</label>
                        <input
                          type="number"
                          value={recipeData.calories}
                          onChange={(e) => setRecipeData({ ...recipeData, calories: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Protein (g)</label>
                        <input
                          type="number"
                          value={recipeData.protein}
                          onChange={(e) => setRecipeData({ ...recipeData, protein: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Carbs (g)</label>
                        <input
                          type="number"
                          value={recipeData.carbs}
                          onChange={(e) => setRecipeData({ ...recipeData, carbs: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Fats (g)</label>
                        <input
                          type="number"
                          value={recipeData.fats}
                          onChange={(e) => setRecipeData({ ...recipeData, fats: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Ingredients</label>
                      <textarea
                        rows="4"
                        placeholder="Enter each ingredient on a new line"
                        value={recipeData.ingredients}
                        onChange={(e) => setRecipeData({ ...recipeData, ingredients: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Instructions</label>
                      <textarea
                        rows="4"
                        placeholder="Enter step-by-step instructions"
                        value={recipeData.instructions}
                        onChange={(e) => setRecipeData({ ...recipeData, instructions: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Link Import */}
                {addMethod === 'link' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Recipe URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/recipe"
                        value={recipeData.url}
                        onChange={(e) => setRecipeData({ ...recipeData, url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Note: URL import coming soon! For now, please use manual entry.
                    </p>
                  </div>
                )}

                {/* Scan Import */}
                {addMethod === 'scan' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                      <Camera className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">Take a photo of your cookbook page</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Note: Cookbook scanning coming soon! For now, please use manual entry.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={addMethod !== 'manual'}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} className="inline mr-2" />
                    Save Recipe
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const RecipeDetailModal = () => {
    if (!selectedRecipe) return null;

    return (
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRecipe(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20">
                {selectedRecipe.image && typeof selectedRecipe.image === 'string' && selectedRecipe.image.startsWith('http') ? (
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    {selectedRecipe.image || '🍽️'}
                  </div>
                )}
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{selectedRecipe.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{selectedRecipe.description}</p>
                  </div>
                  {selectedRecipe.rating > 0 && (
                    <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-lg">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="font-semibold">{selectedRecipe.rating}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{selectedRecipe.calories}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{selectedRecipe.protein}g</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{selectedRecipe.cookTime}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cook Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{selectedRecipe.difficulty}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty</p>
                  </div>
                </div>

                {selectedRecipe.timesCooked > 0 && (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <TrendingUp className="text-green-500" size={16} />
                      <span>Cooked {selectedRecipe.timesCooked} times</span>
                      {selectedRecipe.lastCooked && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>Last made {selectedRecipe.lastCooked}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Ingredients</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                      {selectedRecipe.ingredients.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRecipe.instructions && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Instructions</h3>
                    {Array.isArray(selectedRecipe.instructions) ? (
                      <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                        {selectedRecipe.instructions.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{selectedRecipe.instructions}</p>
                    )}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleAddToToday(selectedRecipe);
                      setSelectedRecipe(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <Plus size={20} className="inline mr-2" />
                    Add to Today
                  </button>
                  <button
                    onClick={() => navigate('/planner')}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Timer size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <Heart className="mr-3 text-red-500" size={32} />
              Recipe Book
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Your saved recipes and meal collections</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Recipe
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-1 mb-6">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span>{tab.name}</span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex space-x-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedFilter === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFavourites.map((recipe, idx) => (
          <RecipeCard key={recipe.id || idx} recipe={recipe} />
        ))}
      </div>

      {/* Empty State */}
      {filteredFavourites.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-8 text-center">
          <Heart className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No recipes found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Add Your First Recipe
          </button>
        </div>
      )}

      {/* Modals */}
      <AddRecipeModal />
      <RecipeDetailModal />
    </div>
  );
};

export default Favourites;
