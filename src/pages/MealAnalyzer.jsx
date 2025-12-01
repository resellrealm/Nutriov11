import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera,
  Upload,
  Sparkles,
  Info,
  Plus,
  Heart,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  ScanBarcode,
  Crown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { incrementDailyScans, resetDailyScans } from '../store/authSlice';
import { MAX_DAILY_SCANS, MAX_DAILY_SCANS_PREMIUM, MAX_FILE_SIZE, ERROR_MESSAGES } from '../config/constants';
import { analyzeMealPhoto, isGeminiConfigured } from '../services/geminiService';
import { logFoodItem } from '../services/foodLogService';

const MealAnalyzer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isPremium = useSelector(state => state.auth.isPremium);
  const dailyScansUsed = useSelector(state => state.auth.dailyScansUsed);
  const userId = useSelector(state => state.auth.user?.id);

  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scanMode, setScanMode] = useState('meal'); // 'meal' or 'barcode'
  const [servingsConsumed, setServingsConsumed] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState('lunch');

  useEffect(() => {
    // Reset scans if it's a new day
    dispatch(resetDailyScans());
  }, [dispatch]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(ERROR_MESSAGES.FILE_TOO_LARGE);
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error(ERROR_MESSAGES.INVALID_FILE_TYPE);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setAnalysisResult(null);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const canScanMeal = () => {
    if (scanMode === 'barcode') return true; // Unlimited barcode scans

    // Premium users: hidden cap at 20 scans/day
    if (isPremium) {
      return dailyScansUsed < MAX_DAILY_SCANS_PREMIUM;
    }

    // Free users: 2 scans/day
    return dailyScansUsed < MAX_DAILY_SCANS;
  };

  const analyzeMeal = async () => {
    // Check scan limits
    if (!canScanMeal()) {
      if (isPremium) {
        toast.error(`Daily scan limit reached. Please try again tomorrow.`, {
          duration: 4000,
          icon: '⏰',
        });
      } else {
        toast.error(`Daily limit reached! Upgrade to Premium for more scans.`, {
          duration: 4000,
          icon: '🔒',
        });
      }
      return;
    }

    // Check if Gemini is configured
    if (!isGeminiConfigured() && scanMode === 'meal') {
      toast.error('Gemini API not configured. Please add your API key to .env file.', {
        duration: 5000,
        icon: '⚠️'
      });
      // Use demo mode for development
      useDemoAnalysis();
      return;
    }

    setIsAnalyzing(true);

    // Increment scan count for meal scans (not barcode)
    if (scanMode === 'meal') {
      dispatch(incrementDailyScans());
    }

    try {
      if (scanMode === 'barcode') {
        // Barcode mode - use demo data for now
        // In production, this would scan a barcode from the image
        setTimeout(() => {
          setAnalysisResult({
            name: 'Nature Valley Granola Bar',
            confidence: 98,
            barcode: '016000275287',
            nutrition: {
              calories: 190,
              protein: 4,
              carbs: 29,
              fat: 7,
              fiber: 2,
              sugar: 11,
              sodium: 160
            },
            ingredients: [
              { name: 'Whole Grain Oats', amount: '30g', calories: 110 },
              { name: 'Sugar', amount: '11g', calories: 44 },
              { name: 'Canola Oil', amount: '5g', calories: 45 }
            ],
            suggestions: [
              { text: 'Contains added sugars', type: 'improve' },
              { text: 'Good source of whole grains', type: 'positive' }
            ],
            healthScore: 65,
            mealType: 'snack'
          });
          setIsAnalyzing(false);
          toast.success('Barcode scanned!');
        }, 1500);
      } else {
        // Meal photo analysis with Gemini AI
        const result = await analyzeMealPhoto(selectedImage);

        if (result.success) {
          setAnalysisResult(result.data);
          setSelectedMealType(result.data.mealType || 'lunch');
          toast.success('Meal analyzed successfully! 🎉');
        } else if (result.demoMode) {
          // API not configured, use demo
          toast('Using demo mode (Gemini not configured)', { icon: 'ℹ️' });
          useDemoAnalysis();
        } else {
          toast.error(result.message || 'Failed to analyze meal');
        }

        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Error analyzing meal:', error);
      toast.error('An error occurred during analysis');
      setIsAnalyzing(false);
    }
  };

  // Demo analysis for development/testing
  const useDemoAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult({
        name: 'Grilled Chicken Salad (Demo)',
        confidence: 92,
        totalWeight: 350,
        nutrition: {
          calories: 385,
          protein: 42,
          carbs: 18,
          fat: 16,
          fiber: 6,
          sugar: 4,
          sodium: 420
        },
        ingredients: [
          { name: 'Grilled chicken breast', amount: '150g', calories: 165 },
          { name: 'Mixed greens', amount: '100g', calories: 25 },
          { name: 'Cherry tomatoes', amount: '50g', calories: 15 },
          { name: 'Cucumber', amount: '50g', calories: 8 },
          { name: 'Olive oil dressing', amount: '15ml', calories: 120 }
        ],
        suggestions: [
          { text: 'Great protein content!', type: 'positive' },
          { text: 'Add quinoa for more complex carbs', type: 'improve' },
          { text: 'Consider adding avocado for healthy fats', type: 'improve' }
        ],
        healthScore: 88,
        mealType: 'lunch'
      });
      setIsAnalyzing(false);
      toast.success('Meal analyzed (demo mode)!');
    }, 2000);
  };

  const saveMeal = async () => {
    if (!analysisResult || !userId) {
      toast.error('Missing meal data or user information');
      return;
    }

    try {
      // Calculate total nutrition based on servings
      const totalNutrition = {
        calories: Math.round((analysisResult.nutrition.calories || 0) * servingsConsumed),
        protein: Math.round((analysisResult.nutrition.protein || 0) * servingsConsumed),
        carbs: Math.round((analysisResult.nutrition.carbs || 0) * servingsConsumed),
        fat: Math.round((analysisResult.nutrition.fat || 0) * servingsConsumed),
        fiber: Math.round((analysisResult.nutrition.fiber || 0) * servingsConsumed),
        sugar: Math.round((analysisResult.nutrition.sugar || 0) * servingsConsumed),
        sodium: Math.round((analysisResult.nutrition.sodium || 0) * servingsConsumed)
      };

      const foodData = {
        name: analysisResult.name,
        brand: '',
        imageUrl: selectedImage, // Store the analyzed image
        servingSize: {
          amount: analysisResult.totalWeight || 1,
          unit: analysisResult.totalWeight ? 'g' : 'serving'
        },
        servingsConsumed: servingsConsumed,
        nutrition: totalNutrition,
        mealType: selectedMealType,
        source: 'photo',
        date: new Date().toISOString().split('T')[0]
      };

      const result = await logFoodItem(userId, foodData);

      if (result.success) {
        toast.success('Meal added to your diary! 🎉');
        // Reset state
        setSelectedImage(null);
        setAnalysisResult(null);
        setServingsConsumed(1);
        // Navigate to dashboard
        navigate('/');
      } else {
        toast.error(result.error || 'Failed to save meal');
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('An error occurred while saving meal');
    }
  };

  const remainingScans = isPremium ? '∞' : Math.max(0, MAX_DAILY_SCANS - dailyScansUsed);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Camera className="mr-3 text-primary" size={32} />
              Analyze Your Meal
            </h1>
            <p className="text-gray-600 mt-2">Take a photo or upload an image of your food for instant nutrition analysis</p>
          </div>
          {!isPremium && scanMode === 'meal' && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">Daily Scans</p>
              <p className="text-2xl font-bold text-amber-600">{remainingScans}/{MAX_DAILY_SCANS}</p>
              <button className="mt-2 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full hover:shadow-lg transition-all flex items-center mx-auto">
                <Crown size={12} className="mr-1" />
                Upgrade
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scan Mode Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium">Scan Type:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setScanMode('meal');
                setSelectedImage(null);
                setAnalysisResult(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                scanMode === 'meal'
                  ? 'bg-gradient-to-r from-primary to-accent text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Camera size={18} />
              <span>Meal Photo</span>
              {!isPremium && <span className="text-xs opacity-75">({remainingScans} left)</span>}
            </button>
            <button
              onClick={() => {
                setScanMode('barcode');
                setSelectedImage(null);
                setAnalysisResult(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                scanMode === 'barcode'
                  ? 'bg-gradient-to-r from-primary to-accent text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ScanBarcode size={18} />
              <span>Barcode</span>
              <span className="text-xs opacity-75">(Unlimited)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {!selectedImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-8"
        >
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            {scanMode === 'meal' ? (
              <Camera className="mx-auto text-gray-400 mb-4" size={64} />
            ) : (
              <ScanBarcode className="mx-auto text-gray-400 mb-4" size={64} />
            )}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {scanMode === 'meal' ? 'Upload Food Photo' : 'Scan Barcode'}
            </h3>
            <p className="text-gray-600 mb-6">
              {scanMode === 'meal'
                ? 'Take a photo or select from your gallery'
                : 'Scan product barcode for instant nutrition facts'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <label className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center">
                <Camera size={20} className="mr-2" />
                Take Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              
              <label className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer flex items-center">
                <Upload size={20} className="mr-2" />
                Choose from Gallery
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
            <Info className="text-blue-500 mt-0.5" size={20} />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Take photo from directly above</li>
                <li>Ensure good lighting</li>
                <li>Include all food items in frame</li>
                <li>Use a plain background if possible</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Image Preview & Analysis */}
      {selectedImage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Photo</h3>
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src={selectedImage} 
                alt="Food to analyze" 
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setAnalysisResult(null);
                }}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {!analysisResult && (
              <button
                onClick={analyzeMeal}
                disabled={isAnalyzing}
                className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="mr-2" />
                    Analyze Meal
                  </>
                )}
              </button>
            )}
          </motion.div>

          {/* Analysis Results */}
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {analysisResult.confidence}% confidence
                </span>
              </div>
              
              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-800 mb-2">{analysisResult.name}</h4>
                
                {/* Nutrition Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-2xl font-bold text-primary">{analysisResult.nutrition.calories}</p>
                    <p className="text-sm text-gray-600">Calories</p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-3">
                    <p className="text-2xl font-bold text-accent">{analysisResult.nutrition.protein}g</p>
                    <p className="text-sm text-gray-600">Protein</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3">
                    <p className="text-xl font-bold text-blue-600">{analysisResult.nutrition.carbs}g</p>
                    <p className="text-sm text-gray-600">Carbs</p>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-3">
                    <p className="text-xl font-bold text-orange-600">{analysisResult.nutrition.fats}g</p>
                    <p className="text-sm text-gray-600">Fats</p>
                  </div>
                </div>
                
                {/* Ingredients */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Detected Ingredients:</h5>
                  <ul className="space-y-1">
                    {analysisResult.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <Check className="text-green-500 mr-2" size={16} />
                        {typeof ingredient === 'string' ? ingredient : `${ingredient.name} (${ingredient.amount})`}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Servings */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servings: {servingsConsumed}x
                  </label>
                  <input
                    type="range"
                    min="0.25"
                    max="3"
                    step="0.25"
                    value={servingsConsumed}
                    onChange={(e) => setServingsConsumed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.25</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                  </div>
                </div>

                {/* Meal Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
                      { id: 'lunch', label: 'Lunch', icon: '☀️' },
                      { id: 'dinner', label: 'Dinner', icon: '🌙' },
                      { id: 'snack', label: 'Snack', icon: '🍿' }
                    ].map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => setSelectedMealType(meal.id)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          selectedMealType === meal.id
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xl mb-1">{meal.icon}</div>
                        <div className="text-xs font-medium">{meal.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Suggestions */}
                <div>
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center"
                  >
                    <TrendingUp size={16} className="mr-1" />
                    {showSuggestions ? 'Hide' : 'Show'} Suggestions
                  </button>
                  
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 space-y-2"
                    >
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`text-sm p-2 rounded-lg flex items-start space-x-2 ${
                            suggestion.type === 'positive' 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {suggestion.type === 'positive' ? (
                            <Check size={16} className="mt-0.5" />
                          ) : (
                            <AlertCircle size={16} className="mt-0.5" />
                          )}
                          <span>{suggestion.text}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={saveMeal}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                >
                  <Plus size={20} className="mr-2" />
                  Add to Diary
                </button>
                <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <Heart size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Recent Analyses */}
      <div className="mt-8 bg-white rounded-2xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Analyses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Breakfast Bowl', time: '8:30 AM', calories: 420 },
            { name: 'Turkey Sandwich', time: 'Yesterday', calories: 380 },
            { name: 'Protein Shake', time: '2 days ago', calories: 280 }
          ].map((meal, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
              <p className="font-medium text-gray-800">{meal.name}</p>
              <p className="text-sm text-gray-600">{meal.time}</p>
              <p className="text-sm font-semibold text-primary mt-1">{meal.calories} cal</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealAnalyzer;
