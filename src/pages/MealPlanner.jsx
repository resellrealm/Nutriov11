import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Camera,
  Sparkles,
  Clock,
  ChevronRight,
  RefreshCw,
  Heart,
  Plus,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Utensils,
  Loader,
  Calendar,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeFridgePhoto, generateMealSuggestionsFromIngredients } from '../services/geminiService';
import { getUserGoals } from '../services/goalsService';
import { logFoodItem } from '../services/foodLogService';
import { saveUserRecipe } from '../services/recipeService';
import { getUserProfile } from '../services/userService';
import { getMealsForUser } from '../services/aiMealGenerationService';
import { logError } from '../utils/errorLogger';

const MealPlanner = () => {
  const user = useSelector(state => state.auth.user);
  const userId = user?.id;

  // Tab state
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'scanner'

  // Scanner tab state
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [fridgeScanned, setFridgeScanned] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [suggestedMeals, setSuggestedMeals] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [userGoals, setUserGoals] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealDetailModal, setShowMealDetailModal] = useState(false);

  // Weekly meals state
  const [weeklyMeals, setWeeklyMeals] = useState(null);
  const [loadingWeeklyMeals, setLoadingWeeklyMeals] = useState(false);

  // Fetch user goals and profile
  useEffect(() => {
    const loadUserGoals = async () => {
      const result = await getUserGoals(userId);
      if (result.success && result.data) {
        setUserGoals(result.data);
      }
    };

    const loadUserProfileAndMeals = async () => {
      setLoadingWeeklyMeals(true);
      try {
        // Fetch user profile
        const profileResult = await getUserProfile(userId);
        if (profileResult.success) {
          const profile = profileResult.data;

          // Fetch AI-generated meals with allergy filtering
          const meals = await getMealsForUser(profile);
          setWeeklyMeals(meals);
        }
      } catch (error) {
        logError('MealPlanner.loadUserProfileAndMeals', error);
        toast.error('Failed to load weekly meals');
      } finally {
        setLoadingWeeklyMeals(false);
      }
    };

    if (userId) {
      loadUserGoals();
      loadUserProfileAndMeals();
    }
  }, [userId]);

  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', icon: Coffee, emoji: '🌅' },
    { id: 'lunch', name: 'Lunch', icon: Sun, emoji: '☀️' },
    { id: 'dinner', name: 'Dinner', icon: Moon, emoji: '🌙' },
    { id: 'snack', name: 'Snack', icon: Cookie, emoji: '🍿' }
  ];

  const difficulties = [
    { id: 'easy', name: 'Easy', time: '< 20 min', color: 'text-green-500' },
    { id: 'medium', name: 'Medium', time: '20-40 min', color: 'text-yellow-500' },
    { id: 'hard', name: 'Hard', time: '40+ min', color: 'text-red-500' }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        analyzeFridgePhotoAI(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a valid image file');
    }
  };

  const analyzeFridgePhotoAI = async (imageBase64) => {
    setIsScanning(true);
    toast.loading('Analyzing your ingredients with AI...', { id: 'scanning' });

    try {
      const result = await analyzeFridgePhoto(imageBase64);

      if (result.success && result.data) {
        const ingredients = result.data.ingredients || [];
        setDetectedIngredients(ingredients);
        setFridgeScanned(true);
        toast.success(`Found ${ingredients.length} ingredients!`, { id: 'scanning' });
      } else if (result.demoMode) {
        // Demo mode fallback
        const mockIngredients = [
          { name: 'Eggs', quantity: '12', category: 'proteins' },
          { name: 'Avocado', quantity: '2', category: 'produce' },
          { name: 'Bread', quantity: '1 loaf', category: 'grains_bread' },
          { name: 'Tomatoes', quantity: '4', category: 'produce' },
          { name: 'Quinoa', quantity: '1 bag', category: 'grains_bread' },
          { name: 'Broccoli', quantity: '1 bunch', category: 'produce' },
          { name: 'Sweet potato', quantity: '3', category: 'produce' },
          { name: 'Chickpeas', quantity: '2 cans', category: 'pantry' },
          { name: 'Hummus', quantity: '1 tub', category: 'condiments' },
          { name: 'Bell peppers', quantity: '3', category: 'produce' },
          { name: 'Feta cheese', quantity: '1 block', category: 'dairy' },
          { name: 'Olive oil', quantity: '1 bottle', category: 'condiments' }
        ];
        setDetectedIngredients(mockIngredients);
        setFridgeScanned(true);
        toast.success(`Demo mode: Found ${mockIngredients.length} ingredients!`, { id: 'scanning' });
      } else {
        toast.error(result.message || 'Failed to analyze image', { id: 'scanning' });
      }
    } catch (error) {
      logError('MealPlanner.handleFridgePhotoUpload', error);
      toast.error('Failed to analyze fridge photo', { id: 'scanning' });
    } finally {
      setIsScanning(false);
    }
  };

  const scanFridge = () => {
    document.getElementById('fridge-photo-input').click();
  };

  const generateMealPlan = async () => {
    if (!detectedIngredients.length) {
      toast.error('Please scan your fridge first!');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating personalized meal suggestions...', { id: 'generating' });

    try {
      const result = await generateMealSuggestionsFromIngredients(
        detectedIngredients,
        userGoals,
        selectedMealType,
        selectedDifficulty
      );

      if (result.success && result.data) {
        setSuggestedMeals(result.data);
        toast.success(`Found ${result.data.length} perfect recipes!`, { id: 'generating' });
      } else if (result.demoMode) {
        // Demo mode fallback
        toast.success('Demo mode: Using sample recipes', { id: 'generating' });
        // Will show empty for now, AI will generate real ones with API key
        setSuggestedMeals([]);
      } else {
        toast.error('Failed to generate meal suggestions', { id: 'generating' });
      }
    } catch (error) {
      logError('MealPlanner.generateMealPlan', error);
      toast.error('Failed to generate meals', { id: 'generating' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCookThis = async (meal) => {
    if (!userId) {
      toast.error('Please log in to add meals');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      const foodItem = {
        name: meal.name,
        brand: 'Homemade',
        servingsConsumed: 1,
        nutrition: {
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          fiber: meal.fiber || 0
        },
        source: 'meal_planner'
      };

      const result = await logFoodItem(userId, today, selectedMealType, foodItem);

      if (result.success) {
        toast.success(`${meal.name} added to your ${selectedMealType} log!`);
      } else {
        toast.error('Failed to add meal to food log');
      }
    } catch (error) {
      logError('MealPlanner.handleAddMealToLog', error);
      toast.error('Failed to add meal');
    }
  };

  const handleSaveToFavourites = async (meal) => {
    if (!userId) {
      toast.error('Please log in to save recipes');
      return;
    }

    try {
      const recipe = {
        name: meal.name,
        description: meal.description || '',
        mealType: selectedMealType,
        servings: 1,
        cookTime: meal.cookTime || '30 min',
        difficulty: meal.difficulty || 'Medium',
        nutrition: {
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          fiber: meal.fiber || 0
        },
        ingredients: meal.ingredients || [],
        instructions: meal.instructions || [],
        tags: ['meal_planner'],
        source: 'meal_planner'
      };

      const result = await saveUserRecipe(userId, recipe);

      if (result.success) {
        toast.success(`${meal.name} saved to your recipe book!`);
      } else {
        toast.error('Failed to save recipe');
      }
    } catch (error) {
      logError('MealPlanner.handleSaveToFavourites', error);
      toast.error('Failed to save recipe');
    }
  };

  const handleViewDetails = (meal) => {
    setSelectedMeal(meal);
    setShowMealDetailModal(true);
  };

  const MealCard = ({ meal }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-xl">
        {meal.image && (
          <img
            src={meal.image}
            alt={meal.name}
            className="w-full h-full object-cover rounded-t-xl"
          />
        )}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-lg">
          <span className="text-sm font-semibold text-primary dark:text-primary-light">
            {meal.matchScore || 0}% match
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-2">{meal.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{meal.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center">
            <Clock size={14} className="mr-1" />
            {meal.cookTime}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            meal.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
            meal.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            {meal.difficulty}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-2 py-1 rounded font-medium">
              {meal.calories || 0} cal
            </span>
            <span className="text-xs bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent-light px-2 py-1 rounded font-medium">
              {meal.protein || 0}g protein
            </span>
          </div>
        </div>

        {meal.reason && (
          <p className="text-xs text-green-600 dark:text-green-400 mb-3 italic">
            💡 {meal.reason}
          </p>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => handleCookThis(meal)}
            className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-2 rounded-lg font-medium hover:shadow-md transition-all text-sm"
          >
            <Utensils size={16} className="inline mr-1" />
            Cook This
          </button>
          <button
            onClick={() => handleSaveToFavourites(meal)}
            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Save to Recipe Book"
          >
            <Heart size={18} />
          </button>
          <button
            onClick={() => handleViewDetails(meal)}
            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="View Recipe"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <ChefHat className="mr-3 text-purple-500" size={32} />
          Smart Meal Planner
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {activeTab === 'weekly' ?
            'AI-generated meals personalized for your goals and dietary needs' :
            'Scan your fridge and get AI-powered meal suggestions based on your goals'
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-2 mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
            activeTab === 'weekly'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Calendar className="inline mr-2" size={18} />
          This Week's Meals
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
            activeTab === 'scanner'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Camera className="inline mr-2" size={18} />
          Fridge Scanner
        </button>
      </div>

      {/* Weekly Meals Tab */}
      {activeTab === 'weekly' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {loadingWeeklyMeals ? (
            <div className="text-center py-12">
              <Loader className="animate-spin mx-auto text-primary mb-3" size={48} />
              <p className="text-gray-600 dark:text-gray-400">Loading your personalized meals...</p>
            </div>
          ) : weeklyMeals ? (
            <>
              {/* Meal Type Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {mealTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedMealType(type.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                      selectedMealType === type.id
                        ? 'bg-primary/10 text-primary border-2 border-primary'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <type.icon size={18} />
                    {type.name}
                  </button>
                ))}
              </div>

              {/* Meals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeklyMeals[selectedMealType]?.map((meal, index) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-5 hover:shadow-lg transition cursor-pointer"
                    onClick={() => {
                      setSelectedMeal(meal);
                      setShowMealDetailModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl">{meal.image || '🍽️'}</span>
                      <div className="flex gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          meal.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          meal.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {meal.difficulty}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {meal.name}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {meal.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded text-xs font-medium">
                        {meal.calories} cal
                      </span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                        {meal.protein}g protein
                      </span>
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs font-medium">
                        {meal.cookTime}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {meal.tags?.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="text-primary font-medium text-sm hover:underline">
                        View Recipe →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {(!weeklyMeals[selectedMealType] || weeklyMeals[selectedMealType].length === 0) && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                  <Sparkles className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No meals available for this category</p>
                  <p className="text-sm text-gray-500">Try refreshing or check back later!</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <ChefHat className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No weekly meals generated yet</p>
              <p className="text-sm text-gray-500">Check back soon for AI-generated meal plans!</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Fridge Scanner Tab */}
      {activeTab === 'scanner' && (
        <>
      {/* Step 1: Scan Fridge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Step 1: What ingredients do you have?
          </h2>
          {fridgeScanned && (
            <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
              ✓ {detectedIngredients.length} ingredients found
            </span>
          )}
        </div>

        {/* Hidden file input */}
        <input
          id="fridge-photo-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {!fridgeScanned ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
            <Camera className="mx-auto text-gray-400 dark:text-gray-500 mb-3" size={48} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Take a photo of your fridge or cupboard</p>
            <button
              onClick={scanFridge}
              disabled={isScanning}
              className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader className="animate-spin inline mr-2" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera size={20} className="inline mr-2" />
                  Upload Photo
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Supports JPG, PNG, HEIC</p>
          </div>
        ) : (
          <div>
            {uploadedImage && (
              <div className="mb-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded fridge"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                Detected {detectedIngredients.length} ingredients:
              </p>
              <div className="flex flex-wrap gap-2">
                {detectedIngredients.map((item, index) => (
                  <span key={index} className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow-sm">
                    {item.name} {item.quantity && `(${item.quantity})`}
                  </span>
                ))}
              </div>
              <button
                onClick={scanFridge}
                className="mt-3 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center"
              >
                <RefreshCw size={14} className="mr-1" />
                Upload New Photo
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Step 2: Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Step 2: Choose your preferences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meal Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Meal Type</label>
            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedMealType(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedMealType === type.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{type.emoji}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Difficulty Level</label>
            <div className="space-y-2">
              {difficulties.map(diff => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                    selectedDifficulty === diff.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">{diff.name}</span>
                  <span className={`text-sm ${diff.color}`}>{diff.time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Goals Preview */}
        {userGoals && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
              🎯 Your Nutrition Goals:
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                {userGoals.calories} cal
              </span>
              <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                {userGoals.protein}g protein
              </span>
              <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                {userGoals.carbs}g carbs
              </span>
              <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                {userGoals.fats}g fat
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Step 3: Generate Meal Plan */}
      {fridgeScanned && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <button
            onClick={generateMealPlan}
            disabled={isGenerating}
            className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader className="animate-spin inline mr-2" size={20} />
                Generating AI Suggestions...
              </>
            ) : (
              <>
                <Sparkles size={20} className="inline mr-2" />
                Generate Meal Suggestions
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Suggested Meals */}
      {suggestedMeals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              AI-Generated Meal Suggestions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedMeals.map((meal, idx) => (
              <MealCard key={idx} meal={meal} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Meal Detail Modal */}
      <AnimatePresence>
        {showMealDetailModal && selectedMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMealDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-primary to-accent text-white p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedMeal.name}</h2>
                    <p className="text-white/90">{selectedMeal.description}</p>
                  </div>
                  <button
                    onClick={() => setShowMealDetailModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Nutrition Facts */}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Nutrition Facts</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary dark:text-primary-light">{selectedMeal.calories || 0}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Calories</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-accent dark:text-accent-light">{selectedMeal.protein || 0}g</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-500">{selectedMeal.carbs || 0}g</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-500">{selectedMeal.fat || 0}g</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Fat</p>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                {selectedMeal.ingredients && selectedMeal.ingredients.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Ingredients</h3>
                    <div className="space-y-2">
                      {selectedMeal.ingredients.map((ingredient, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          <span>{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {selectedMeal.instructions && selectedMeal.instructions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Instructions</h3>
                    <div className="space-y-3">
                      {selectedMeal.instructions.map((step, idx) => (
                        <div key={idx} className="flex space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Why This Meal */}
                {selectedMeal.reason && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>💡 Why this meal?</strong><br />
                      {selectedMeal.reason}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleCookThis(selectedMeal);
                      setShowMealDetailModal(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    <Utensils size={18} className="inline mr-2" />
                    Cook This Now
                  </button>
                  <button
                    onClick={() => {
                      handleSaveToFavourites(selectedMeal);
                      setShowMealDetailModal(false);
                    }}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Heart size={18} className="inline mr-2" />
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close Scanner Tab */}
        </>
      )}
    </div>
  );
};

export default MealPlanner;
