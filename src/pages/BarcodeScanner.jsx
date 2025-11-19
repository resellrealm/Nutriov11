import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Camera,
  X,
  Flashlight,
  FlashlightOff,
  Keyboard,
  Search,
  Loader,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductByBarcode, isValidBarcode } from '../services/openFoodFactsService';
import { logFoodItem } from '../services/foodLogService';

/**
 * Barcode Scanner Component
 *
 * NOTE: This component requires @capacitor/camera to be installed for full functionality
 *
 * Installation:
 * npm install @capacitor/camera
 * npx cap sync
 *
 * iOS: Add camera usage description in Info.plist
 * Android: Add camera permissions in AndroidManifest.xml
 */

const BarcodeScanner = () => {
  const navigate = useNavigate();
  const userId = useSelector(state => state.auth.user?.id);

  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [servingsConsumed, setServingsConsumed] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState('snack');

  // PLACEHOLDER: Replace with actual Capacitor Camera implementation
  const startScanning = async () => {
    toast('📷 Camera scanning will be available after installing @capacitor/camera', {
      duration: 4000
    });

    /*
    ACTUAL IMPLEMENTATION (uncomment after installing @capacitor/camera):

    import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

    const startScanning = async () => {
      try {
        // Check camera permission
        const status = await BarcodeScanner.checkPermission({ force: true });

        if (!status.granted) {
          toast.error('Camera permission denied');
          return;
        }

        // Hide webview to show camera
        document.body.classList.add('scanner-active');
        BarcodeScanner.hideBackground();

        setIsScanning(true);

        // Start scanning
        const result = await BarcodeScanner.startScan();

        if (result.hasContent) {
          handleBarcodeScanned(result.content);
        }

        setIsScanning(false);
        BarcodeScanner.showBackground();
        document.body.classList.remove('scanner-active');

      } catch (error) {
        console.error('Scanning error:', error);
        toast.error('Failed to start camera');
        setIsScanning(false);
      }
    };
    */

    setManualEntry(true); // For now, default to manual entry
  };

  const stopScanning = () => {
    setIsScanning(false);
    // BarcodeScanner.stopScan();
    // BarcodeScanner.showBackground();
  };

  const handleBarcodeScanned = async (barcode) => {
    if (!isValidBarcode(barcode)) {
      toast.error('Invalid barcode format');
      return;
    }

    setIsLoading(true);
    stopScanning();

    try {
      const result = await getProductByBarcode(barcode);

      if (result.success) {
        setProduct(result.data);
        toast.success(`Found: ${result.data.name}`);
      } else {
        toast.error(result.error || 'Product not found');
        setManualEntry(true);
        setManualBarcode(barcode);
      }
    } catch {
      toast.error('Failed to fetch product information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!manualBarcode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }

    await handleBarcodeScanned(manualBarcode.trim());
  };

  const handleLogFood = async () => {
    if (!product || !userId) {
      toast.error('Missing product or user information');
      return;
    }

    setIsLoading(true);

    try {
      // Calculate total nutrition based on servings
      const totalNutrition = {
        calories: Math.round((product.nutrition.calories || 0) * servingsConsumed),
        protein: Math.round((product.nutrition.protein || 0) * servingsConsumed),
        carbs: Math.round((product.nutrition.carbs || 0) * servingsConsumed),
        fat: Math.round((product.nutrition.fat || 0) * servingsConsumed),
        fiber: Math.round((product.nutrition.fiber || 0) * servingsConsumed),
        sugar: Math.round((product.nutrition.sugar || 0) * servingsConsumed),
        sodium: Math.round((product.nutrition.sodium || 0) * servingsConsumed)
      };

      const foodData = {
        name: product.name,
        brand: product.brand,
        barcode: product.barcode,
        imageUrl: product.imageUrl,
        servingSize: product.servingSize,
        servingsConsumed: servingsConsumed,
        nutrition: totalNutrition,
        mealType: selectedMealType,
        source: 'barcode',
        date: new Date().toISOString().split('T')[0]
      };

      const result = await logFoodItem(userId, foodData);

      if (result.success) {
        toast.success('Food logged successfully!');
        setProduct(null);
        setServingsConsumed(1);
        navigate('/'); // Navigate back to dashboard
      } else {
        toast.error(result.error || 'Failed to log food');
      }
    } catch {
      toast.error('An error occurred while logging food');
    } finally {
      setIsLoading(false);
    }
  };

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: 'Lunch', icon: '☀️' },
    { id: 'dinner', label: 'Dinner', icon: '🌙' },
    { id: 'snack', label: 'Snack', icon: '🍿' }
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}>
      {!isScanning && !product && (
        /* Scanner Home */
        <div className="p-6 space-y-6" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Camera className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Scan Food</h1>
                <p className="text-sm text-gray-600">Quick nutrition tracking</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Scan the barcode on your food package</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>We'll automatically fetch nutrition information</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Adjust servings and log to your diary</span>
              </li>
            </ol>
          </div>

          {/* Scan Button */}
          <button
            onClick={startScanning}
            className="w-full py-6 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center space-x-3"
          >
            <Camera size={28} />
            <span>Start Scanning</span>
          </button>

          {/* Manual Entry */}
          <div className="text-center">
            <button
              onClick={() => setManualEntry(true)}
              className="text-primary hover:text-primary/80 font-medium flex items-center justify-center space-x-2 mx-auto"
            >
              <Keyboard size={20} />
              <span>Enter barcode manually</span>
            </button>
          </div>

          {manualEntry && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border-2 border-gray-200"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Manual Barcode Entry</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  placeholder="Enter barcode number"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleManualSearch}
                  disabled={isLoading}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {isScanning && (
        /* Camera View (Placeholder) */
        <div className="fixed inset-0 bg-black z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-4 border-white rounded-2xl"></div>
          </div>

          <div className="absolute top-8 left-0 right-0 text-center">
            <p className="text-white text-lg font-medium">Point at barcode</p>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4">
            <button
              onClick={() => setFlashEnabled(!flashEnabled)}
              className="p-4 bg-white/20 backdrop-blur rounded-full"
            >
              {flashEnabled ? (
                <Flashlight className="text-yellow-400" size={28} />
              ) : (
                <FlashlightOff className="text-white" size={28} />
              )}
            </button>

            <button
              onClick={stopScanning}
              className="p-4 bg-red-500 rounded-full"
            >
              <X className="text-white" size={28} />
            </button>
          </div>
        </div>
      )}

      {product && (
        /* Product Details */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Product Found!</h2>
            <button
              onClick={() => setProduct(null)}
              className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Product Card */}
          <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-contain bg-gray-50"
              />
            )}

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
              {product.brand && (
                <p className="text-gray-600 mb-4">{product.brand}</p>
              )}

              {/* Nutrition Facts */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Nutrition Facts</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-semibold ml-2">{product.nutrition.calories}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-semibold ml-2">{product.nutrition.protein}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbs:</span>
                    <span className="font-semibold ml-2">{product.nutrition.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fat:</span>
                    <span className="font-semibold ml-2">{product.nutrition.fat}g</span>
                  </div>
                </div>
              </div>

              {/* Servings */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings Consumed: {servingsConsumed}
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="5"
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
                  <span>5</span>
                </div>
              </div>

              {/* Meal Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Meal Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {mealTypes.map((meal) => (
                    <button
                      key={meal.id}
                      onClick={() => setSelectedMealType(meal.id)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedMealType === meal.id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{meal.icon}</div>
                      <div className="text-xs font-medium">{meal.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Log Button */}
              <button
                onClick={handleLogFood}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Logging...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Add to Food Log</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BarcodeScanner;
