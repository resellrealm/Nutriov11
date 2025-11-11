import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Camera, 
  Sparkles,
  Clock,
  Users,
  ChevronRight,
  RefreshCw,
  Heart,
  Plus,
  Filter,
  Coffee,
  Sun,
  Moon,
  Cookie
} from 'lucide-react';
import toast from 'react-hot-toast';

const MealPlanner = () => {
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [fridgeScanned, setFridgeScanned] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedMeals, setSuggestedMeals] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectedIngredients, setDetectedIngredients] = useState([]);

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
        analyzeFridgePhoto(file);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a valid image file');
    }
  };

  const analyzeFridgePhoto = (file) => {
    toast.success('Analyzing your ingredients...');

    // Simulate AI analysis with realistic delay
    setTimeout(() => {
      // In real implementation, this would call an AI API
      const mockIngredients = [
        'Eggs', 'Avocado', 'Bread', 'Tomatoes', 'Quinoa',
        'Broccoli', 'Sweet potato', 'Chickpeas', 'Hummus',
        'Bell peppers', 'Feta cheese', 'Olive oil'
      ];
      setDetectedIngredients(mockIngredients);
      setFridgeScanned(true);
      toast.success(`Found ${mockIngredients.length} ingredients!`);
    }, 2500);
  };

  const scanFridge = () => {
    // Trigger file input
    document.getElementById('fridge-photo-input').click();
  };

  const generateMealPlan = () => {
    setIsGenerating(true);

    // In real implementation, this would call a recipe API with detected ingredients
    setTimeout(() => {
      // Generate recipes based on available ingredients and preferences
      const allRecipes = {
        breakfast: [
          {
            id: 1,
            name: 'Avocado Toast with Poached Egg',
            description: 'Whole grain toast topped with mashed avocado, poached egg, and cherry tomatoes',
            cookTime: '15 min',
            difficulty: 'Easy',
            calories: 380,
            protein: 18,
            ingredients: ['Bread', 'Avocado', 'Eggs', 'Tomatoes'],
            matchScore: 95,
            image: '/api/placeholder/300/200'
          },
          {
            id: 2,
            name: 'Veggie Omelette',
            description: 'Fluffy omelette with bell peppers, tomatoes, and feta cheese',
            cookTime: '12 min',
            difficulty: 'Easy',
            calories: 320,
            protein: 22,
            ingredients: ['Eggs', 'Bell peppers', 'Tomatoes', 'Feta cheese'],
            matchScore: 92,
            image: '/api/placeholder/300/200'
          }
        ],
        lunch: [
          {
            id: 3,
            name: 'Quinoa Power Bowl',
            description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
            cookTime: '25 min',
            difficulty: 'Medium',
            calories: 420,
            protein: 15,
            ingredients: ['Quinoa', 'Broccoli', 'Sweet potato', 'Chickpeas'],
            matchScore: 88,
            image: '/api/placeholder/300/200'
          },
          {
            id: 4,
            name: 'Mediterranean Wrap',
            description: 'Whole wheat wrap with hummus, grilled vegetables, and feta cheese',
            cookTime: '10 min',
            difficulty: 'Easy',
            calories: 350,
            protein: 14,
            ingredients: ['Bread', 'Hummus', 'Bell peppers', 'Feta cheese'],
            matchScore: 85,
            image: '/api/placeholder/300/200'
          }
        ],
        dinner: [
          {
            id: 5,
            name: 'Roasted Veggie Quinoa',
            description: 'Hearty quinoa with roasted sweet potato, broccoli, and chickpeas',
            cookTime: '35 min',
            difficulty: 'Medium',
            calories: 480,
            protein: 16,
            ingredients: ['Quinoa', 'Sweet potato', 'Broccoli', 'Chickpeas', 'Olive oil'],
            matchScore: 90,
            image: '/api/placeholder/300/200'
          },
          {
            id: 6,
            name: 'Stuffed Bell Peppers',
            description: 'Bell peppers stuffed with quinoa, chickpeas, and feta',
            cookTime: '40 min',
            difficulty: 'Hard',
            calories: 390,
            protein: 17,
            ingredients: ['Bell peppers', 'Quinoa', 'Chickpeas', 'Feta cheese', 'Tomatoes'],
            matchScore: 87,
            image: '/api/placeholder/300/200'
          }
        ],
        snack: [
          {
            id: 7,
            name: 'Hummus & Veggie Sticks',
            description: 'Fresh bell peppers and broccoli with creamy hummus',
            cookTime: '5 min',
            difficulty: 'Easy',
            calories: 150,
            protein: 6,
            ingredients: ['Hummus', 'Bell peppers', 'Broccoli'],
            matchScore: 95,
            image: '/api/placeholder/300/200'
          },
          {
            id: 8,
            name: 'Avocado Toast Bites',
            description: 'Mini toast slices with mashed avocado and tomato',
            cookTime: '8 min',
            difficulty: 'Easy',
            calories: 180,
            protein: 5,
            ingredients: ['Bread', 'Avocado', 'Tomatoes'],
            matchScore: 88,
            image: '/api/placeholder/300/200'
          }
        ]
      };

      // Filter by meal type and difficulty
      let recipes = allRecipes[selectedMealType] || [];
      if (selectedDifficulty !== 'all') {
        recipes = recipes.filter(r => r.difficulty.toLowerCase() === selectedDifficulty);
      }

      // Calculate match score based on available ingredients
      recipes = recipes.map(recipe => {
        const matchingIngredients = recipe.ingredients.filter(ing =>
          detectedIngredients.some(det => det.toLowerCase().includes(ing.toLowerCase()))
        );
        const matchScore = Math.round((matchingIngredients.length / recipe.ingredients.length) * 100);
        return { ...recipe, matchScore };
      }).sort((a, b) => b.matchScore - a.matchScore);

      setSuggestedMeals(recipes);
      setIsGenerating(false);
      toast.success(`Found ${recipes.length} recipes matching your ingredients!`);
    }, 2000);
  };

  const MealCard = ({ meal }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-xl">
        {meal.image && (
          <img 
            src={meal.image} 
            alt={meal.name}
            className="w-full h-full object-cover rounded-t-xl"
          />
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg">
          <span className="text-sm font-semibold text-primary">{meal.matchScore}% match</span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-gray-800 text-lg mb-2">{meal.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{meal.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="flex items-center">
            <Clock size={14} className="mr-1" />
            {meal.cookTime}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            meal.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
            meal.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {meal.difficulty}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex space-x-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
              {meal.calories} cal
            </span>
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded font-medium">
              {meal.protein}g protein
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-2 rounded-lg font-medium hover:shadow-md transition-all text-sm">
            Cook This
          </button>
          <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Heart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <ChefHat className="mr-3 text-purple-500" size={32} />
          Smart Meal Planner
        </h1>
        <p className="text-gray-600 mt-2">Scan your fridge and get personalized meal suggestions</p>
      </div>

      {/* Step 1: Scan Fridge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Step 1: What ingredients do you have?
          </h2>
          {fridgeScanned && (
            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
              ✓ 12 ingredients found
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
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <Camera className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 mb-4">Take a photo of your fridge or cupboard</p>
            <button
              onClick={scanFridge}
              className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              <Camera size={20} className="inline mr-2" />
              Upload Photo
            </button>
            <p className="text-xs text-gray-500 mt-3">Supports JPG, PNG, HEIC</p>
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
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-700 font-medium mb-2">
                Detected {detectedIngredients.length} ingredients:
              </p>
              <div className="flex flex-wrap gap-2">
                {detectedIngredients.map((item, index) => (
                  <span key={index} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
              <button
                onClick={scanFridge}
                className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
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
        className="bg-white rounded-2xl shadow-card p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Step 2: Choose your preferences
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meal Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Meal Type</label>
            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedMealType(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedMealType === type.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{type.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Difficulty */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty Level</label>
            <div className="space-y-2">
              {difficulties.map(diff => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                    selectedDifficulty === diff.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-gray-700">{diff.name}</span>
                  <span className={`text-sm ${diff.color}`}>{diff.time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
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
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2" />
                Generating...
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
            <h2 className="text-xl font-semibold text-gray-800">Suggested Meals</h2>
            <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center">
              <Filter size={16} className="mr-1" />
              Filter
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedMeals.map(meal => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
          
          <div className="text-center mt-6">
            <button className="text-primary hover:text-primary/80 font-medium">
              Load More Suggestions
              <ChevronRight size={20} className="inline ml-1" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MealPlanner;
