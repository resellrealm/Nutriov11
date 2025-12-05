import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ThumbsUp,
  ThumbsDown,
  Search,
  RotateCcw,
  Zap,
  Crown,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MAX_FILE_SIZE, ERROR_MESSAGES, MAX_DAILY_SCANS } from '../config/constants';
import { analyzeMealPhoto, isGeminiConfigured } from '../services/geminiService';
import { logFoodItem } from '../services/foodLogService';
import onlineFoodResearchService from '../services/onlineFoodResearchService';
import scanFeedbackService from '../services/scanFeedbackService';
import { logError } from '../utils/errorLogger';

// Helper function to generate unique scan IDs
const generateScanId = () => {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const MealAnalyzer = () => {
  const navigate = useNavigate();
  const userId = useSelector(state => state.auth.user?.id);
  const isPremium = useSelector(state => state.auth.isPremium);
  const dailyScansUsed = useSelector(state => state.auth.dailyScansUsed);
  const scanCooldownUntil = useSelector(state => state.auth.scanCooldownUntil);

  // Calculate cooldown time left using state
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);

  useEffect(() => {
    const updateCooldown = () => {
      if (scanCooldownUntil) {
        const timeLeft = Math.max(0, Math.floor((scanCooldownUntil - Date.now()) / 1000));
        setCooldownTimeLeft(timeLeft);
      } else {
        setCooldownTimeLeft(0);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [scanCooldownUntil]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(''); // 'ai', 'research', 'complete'
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [showFeedbackOptions, setShowFeedbackOptions] = useState(false);
  const [selectedWrongReason, setSelectedWrongReason] = useState(null);
  const [scanMode, setScanMode] = useState('meal'); // 'meal' or 'barcode'
  const [servingsConsumed, setServingsConsumed] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [currentScanId, setCurrentScanId] = useState(null);

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
        setShowFeedback(false);
        setFeedbackGiven(null);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMeal = async () => {
    // All users have unlimited scans

    // Check if Gemini is configured
    if (!isGeminiConfigured() && scanMode === 'meal') {
      toast.error('Gemini API not configured. Please add your API key to .env file.', {
        duration: 5000,
        icon: '⚠️'
      });
      // Use demo mode for development
      loadDemoAnalysis();
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStage('ai');

    // Generate scan ID
    const scanId = generateScanId();
    setCurrentScanId(scanId);

    try {
      if (scanMode === 'barcode') {
        // Barcode mode - use demo data for now
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
          setAnalysisStage('complete');
          toast.success('Barcode scanned!');
        }, 1500);
      } else {
        // Meal photo analysis with Gemini AI
        const result = await analyzeMealPhoto(selectedImage);

        if (result.success) {
          let enhancedResult = result.data;

          // Premium users get online research
          if (isPremium) {
            setAnalysisStage('research');
            try {
              const researchedData = await onlineFoodResearchService.researchFood(enhancedResult);
              enhancedResult = { ...researchedData, scanId };
              toast.success('Enhanced with online research! 🎉', { duration: 2000 });
            } catch (error) {
              logError('MealAnalyzer.handleAnalyze', 'Online research failed', { error: error.message });
              enhancedResult = { ...enhancedResult, scanId };
            }
          } else {
            enhancedResult = { ...enhancedResult, scanId };
          }

          setAnalysisResult(enhancedResult);
          setSelectedMealType(enhancedResult.mealType || 'lunch');
          setShowFeedback(true);
          setAnalysisStage('complete');
          toast.success('Meal analyzed successfully! 🎉');
        } else if (result.demoMode) {
          // API not configured, use demo
          toast('Using demo mode (Gemini not configured)', { icon: 'ℹ️' });
          loadDemoAnalysis();
        } else {
          toast.error(result.message || 'Failed to analyze meal');
          setIsAnalyzing(false);
          setAnalysisStage('');
        }

        setIsAnalyzing(false);
      }
    } catch (error) {
      logError('MealAnalyzer.handleAnalyzeMeal', error);
      toast.error('An error occurred during analysis');
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  // Demo analysis for development/testing
  const loadDemoAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStage('ai');
    const scanId = `demo_${Date.now()}`;
    setCurrentScanId(scanId);

    setTimeout(() => {
      setAnalysisResult({
        scanId,
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
        mealType: 'lunch',
        onlineResearchAttempted: isPremium,
        onlineDataFound: isPremium
      });
      setShowFeedback(true);
      setIsAnalyzing(false);
      setAnalysisStage('complete');
      toast.success('Meal analyzed (demo mode)!');
    }, 2000);
  };

  const handleFeedback = async (isCorrect) => {
    setFeedbackGiven(isCorrect);

    if (isCorrect) {
      // Thumbs up - save meal automatically
      toast.success('Great! Adding to your log...', { icon: '👍' });
      setShowFeedback(false);
      await saveMeal(true); // Pass true to indicate feedback was positive
    } else {
      // Thumbs down - show options
      setShowFeedbackOptions(true);
    }
  };

  const handleWrongReasonSelected = async (reason) => {
    setSelectedWrongReason(reason);

    // Submit feedback
    if (currentScanId && analysisResult) {
      try {
        await scanFeedbackService.submitFeedback({
          userId,
          scanId: currentScanId,
          isCorrect: false,
          wrongReason: reason,
          aiResult: {
            name: analysisResult.name,
            confidence: analysisResult.confidence,
            nutrition: analysisResult.nutrition,
            ingredients: analysisResult.ingredients || []
          },
          isPremium,
          hadOnlineResearch: analysisResult.onlineResearchAttempted || false
        });
      } catch (error) {
        logError('MealAnalyzer.handleNegativeFeedback', error);
      }
    }
  };

  const handleManualSearch = () => {
    toast('Manual search feature coming soon!', { icon: '🔍' });
  };

  const handleTryAgain = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setShowFeedback(false);
    setShowFeedbackOptions(false);
    setFeedbackGiven(null);
    setSelectedWrongReason(null);
  };

  const saveMeal = async (wasCorrectFeedback = false) => {
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
        brand: analysisResult.matchedBrand || '',
        imageUrl: selectedImage,
        servingSize: {
          amount: analysisResult.totalWeight || 1,
          unit: analysisResult.totalWeight ? 'g' : 'serving'
        },
        servingsConsumed: servingsConsumed,
        nutrition: totalNutrition,
        mealType: selectedMealType,
        source: 'photo',
        date: new Date().toISOString().split('T')[0],
        confidence: analysisResult.confidence,
        hadOnlineResearch: analysisResult.onlineResearchAttempted || false,
        scanFeedback: {
          wasCorrect: wasCorrectFeedback,
          userCorrected: false,
          confidence: analysisResult.confidence,
          hadOnlineResearch: analysisResult.onlineResearchAttempted || false
        }
      };

      // Submit positive feedback if thumbs up
      if (wasCorrectFeedback && currentScanId) {
        try {
          await scanFeedbackService.submitFeedback({
            userId,
            scanId: currentScanId,
            isCorrect: true,
            wrongReason: null,
            aiResult: {
              name: analysisResult.name,
              confidence: analysisResult.confidence,
              nutrition: analysisResult.nutrition,
              ingredients: analysisResult.ingredients || []
            },
            isPremium,
            hadOnlineResearch: analysisResult.onlineResearchAttempted || false
          });
        } catch (error) {
          logError('MealAnalyzer.handleSaveToLog', error);
        }
      }

      const result = await logFoodItem(userId, foodData);

      if (result.success) {
        toast.success('Meal added to your diary! 🎉');
        // Reset state
        setSelectedImage(null);
        setAnalysisResult(null);
        setServingsConsumed(1);
        setShowFeedback(false);
        setShowFeedbackOptions(false);
        setFeedbackGiven(null);
        // Navigate to dashboard
        navigate('/');
      } else {
        toast.error(result.error || 'Failed to save meal');
      }
    } catch (error) {
      logError('MealAnalyzer.handleSaveToLog', error);
      toast.error('An error occurred while saving meal');
    }
  };

  const getInstantScansRemaining = () => {
    if (!isPremium) return 0;
    return Math.max(0, 15 - dailyScansUsed);
  };

  const getCooldownMessage = () => {
    if (dailyScansUsed < 16) {
      return `${getInstantScansRemaining()} instant scans left`;
    } else if (dailyScansUsed < 26) {
      return '30s cooldown active';
    } else {
      return '2min cooldown active';
    }
  };

  const remainingScans = isPremium
    ? (cooldownTimeLeft > 0 ? `⏱️ ${Math.floor(cooldownTimeLeft / 60)}:${(cooldownTimeLeft % 60).toString().padStart(2, '0')}` : '∞')
    : Math.max(0, MAX_DAILY_SCANS - dailyScansUsed);

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
          {scanMode === 'meal' && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-center min-w-[140px]">
              <p className="text-sm text-gray-600">
                {isPremium ? 'Unlimited Scans' : 'Daily Scans'}
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {isPremium && cooldownTimeLeft === 0 ? '∞' : remainingScans}
                {!isPremium && `/${MAX_DAILY_SCANS}`}
              </p>
              {isPremium && cooldownTimeLeft === 0 && dailyScansUsed > 0 && (
                <p className="text-xs text-gray-500 mt-1">{getCooldownMessage()}</p>
              )}
              {!isPremium && (
                <button className="mt-2 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full hover:shadow-lg transition-all flex items-center mx-auto">
                  <Crown size={12} className="mr-1" />
                  Upgrade
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cooldown Banner (Premium users in cooldown) */}
      {isPremium && cooldownTimeLeft > 0 && scanMode === 'meal' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="text-blue-500" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800">Quick Cooldown</h3>
                <p className="text-sm text-gray-600">
                  You've scanned {dailyScansUsed} items today - taking a quick breather...
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Next scan in</p>
              <p className="text-3xl font-bold text-blue-600">
                {Math.floor(cooldownTimeLeft / 60)}:{(cooldownTimeLeft % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center">
            <Info size={14} className="mr-1" />
            Tip: Barcode scanning is always instant!
          </p>
        </motion.div>
      )}

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
              {isPremium && <Zap size={14} className="text-yellow-300" />}
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
                {isPremium && scanMode === 'meal' && (
                  <li className="font-semibold">✨ Premium: Enhanced with online research!</li>
                )}
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
                  setShowFeedback(false);
                }}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {!analysisResult && (
              <>
                <button
                  onClick={analyzeMeal}
                  disabled={isAnalyzing || cooldownTimeLeft > 0}
                  className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      {analysisStage === 'ai' && 'Analyzing with AI...'}
                      {analysisStage === 'research' && 'Researching online...'}
                    </>
                  ) : cooldownTimeLeft > 0 ? (
                    <>
                      <Clock size={20} className="mr-2" />
                      Wait {Math.floor(cooldownTimeLeft / 60)}:{(cooldownTimeLeft % 60).toString().padStart(2, '0')}
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="mr-2" />
                      Analyze Meal
                    </>
                  )}
                </button>

                {/* Loading Progress (Premium) */}
                {isAnalyzing && isPremium && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Sparkles size={16} className="mr-2 text-purple-500" />
                        Analyzing with AI
                      </span>
                      <span>{analysisStage === 'ai' ? '⏳' : '✓'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Search size={16} className="mr-2 text-blue-500" />
                        Searching online databases
                      </span>
                      <span>{analysisStage === 'research' ? '⏳' : analysisStage === 'complete' ? '✓' : '○'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Check size={16} className="mr-2 text-green-500" />
                        Cross-referencing nutrition
                      </span>
                      <span>{analysisStage === 'complete' ? '✓' : '○'}</span>
                    </div>
                  </div>
                )}
              </>
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
                <div className="flex items-center space-x-2">
                  {analysisResult.onlineDataFound && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center">
                      <Sparkles size={12} className="mr-1" />
                      Verified
                    </span>
                  )}
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {analysisResult.confidence}% confident
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xl font-bold text-gray-800 mb-2">{analysisResult.name}</h4>
                {analysisResult.matchedBrand && (
                  <p className="text-sm text-gray-600 mb-3">Brand: {analysisResult.matchedBrand}</p>
                )}

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
                    <p className="text-xl font-bold text-orange-600">{analysisResult.nutrition.fat}g</p>
                    <p className="text-sm text-gray-600">Fats</p>
                  </div>
                </div>

                {/* Feedback Section */}
                <AnimatePresence>
                  {showFeedback && !feedbackGiven && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                    >
                      <p className="text-sm font-semibold text-gray-800 mb-3 text-center">
                        How did we do?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleFeedback(true)}
                          className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border-2 border-green-300 hover:border-green-500 hover:bg-green-50 transition-all"
                        >
                          <ThumbsUp className="text-green-600 mb-1" size={24} />
                          <span className="text-sm font-medium text-gray-800">Spot On!</span>
                        </button>
                        <button
                          onClick={() => handleFeedback(false)}
                          className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all"
                        >
                          <ThumbsDown className="text-orange-600 mb-1" size={24} />
                          <span className="text-sm font-medium text-gray-800">Not quite right</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Wrong Reason Options */}
                <AnimatePresence>
                  {showFeedbackOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <p className="text-sm font-semibold text-gray-800 mb-3">What went wrong?</p>
                      <div className="space-y-2 mb-4">
                        {[
                          { id: 'wrong_food', label: 'Wrong food entirely', subtitle: '(e.g., thought pizza was pie)' },
                          { id: 'wrong_variant', label: 'Right food, wrong variant', subtitle: '(e.g., chicken pie vs steak)' },
                          { id: 'wrong_portion', label: 'Portion size seems off', subtitle: '(e.g., says 200g but looks 100g)' },
                          { id: 'wrong_nutrition', label: 'Nutrition values don\'t match', subtitle: '(e.g., package says different)' },
                          { id: 'multiple_items', label: 'Multiple items detected as one', subtitle: '(e.g., saw meal as one item)' }
                        ].map((reason) => (
                          <button
                            key={reason.id}
                            onClick={() => handleWrongReasonSelected(reason.id)}
                            className={`w-full text-left p-2 rounded-lg border transition-all ${
                              selectedWrongReason === reason.id
                                ? 'border-orange-500 bg-orange-100'
                                : 'border-gray-300 bg-white hover:border-orange-300'
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-800">{reason.label}</p>
                            <p className="text-xs text-gray-500">{reason.subtitle}</p>
                          </button>
                        ))}
                      </div>

                      <p className="text-sm text-gray-700 font-medium mb-2">What would you like to do?</p>
                      <div className="space-y-2">
                        <button
                          onClick={handleManualSearch}
                          className="w-full p-3 bg-white rounded-lg border border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex items-center"
                        >
                          <Search size={18} className="mr-2 text-primary" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-800">Search manually</p>
                            <p className="text-xs text-gray-500">Find the right food yourself</p>
                          </div>
                        </button>
                        <button
                          onClick={handleTryAgain}
                          className="w-full p-3 bg-white rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center"
                        >
                          <RotateCcw size={18} className="mr-2 text-blue-600" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-800">Try scanning again</p>
                            <p className="text-xs text-gray-500">Retake photo with better angle</p>
                          </div>
                        </button>
                        <button
                          onClick={() => navigate('/barcode')}
                          className="w-full p-3 bg-white rounded-lg border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center"
                        >
                          <ScanBarcode size={18} className="mr-2 text-purple-600" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-800">Enter barcode instead</p>
                            <p className="text-xs text-gray-500">Use barcode for 100% accuracy</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ingredients */}
                {analysisResult.ingredients && analysisResult.ingredients.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Detected Ingredients:</h5>
                    <ul className="space-y-1">
                      {analysisResult.ingredients.slice(0, 5).map((ingredient, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <Check className="text-green-500 mr-2 flex-shrink-0" size={16} />
                          {typeof ingredient === 'string' ? ingredient : `${ingredient.name} (${ingredient.amount})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Servings */}
                {!showFeedbackOptions && (
                  <>
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
                  </>
                )}

                {/* Suggestions */}
                {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
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
                              <Check size={16} className="mt-0.5 flex-shrink-0" />
                            ) : (
                              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            )}
                            <span>{suggestion.text}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!showFeedbackOptions && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => saveMeal(false)}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                  >
                    <Plus size={20} className="mr-2" />
                    Add to Diary
                  </button>
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                    <Heart size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealAnalyzer;
