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

  const scanFridge = () => {
    toast.success('Scanning your fridge/cupboard...');
    setTimeout(() => {
      setFridgeScanned(true);
      toast.success('Found 12 ingredients!');
    }, 2000);
  };

  const generateMealPlan = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      setSuggestedMeals([
        {
          id: 1,
          name: 'Avocado Toast with Poached Egg',
          description: 'Whole grain toast topped with mashed avocado, poached egg, and cherry tomatoes',
          cookTime: '15 min',
          difficulty: 'Easy',
          calories: 380,
          protein: 18,
          ingredients: ['Whole grain bread', 'Avocado', 'Eggs', 'Cherry tomatoes'],
          matchScore: 95,
          image: '/api/placeholder/300/200'
        },
        {
          id: 2,
          name: 'Quinoa Power Bowl',
          description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
          cookTime: '25 min',
          difficulty: 'Easy',
          calories: 420,
          protein: 15,
          ingredients: ['Quinoa', 'Broccoli', 'Sweet potato', 'Chickpeas'],
          matchScore: 88,
          image: '/api/placeholder/300/200'
        },
        {
          id: 3,
          name: 'Mediterranean Wrap',
          description: 'Whole wheat wrap with hummus, grilled vegetables, and feta cheese',
          cookTime: '10 min',
          difficulty: 'Easy',
          calories: 350,
          protein: 14,
          ingredients: ['Whole wheat tortilla', 'Hummus', 'Bell peppers', 'Feta cheese'],
          matchScore: 82,
          image: '/api/placeholder/300/200'
        }
      ]);
      setIsGenerating(false);
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
        
        {!fridgeScanned ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <Camera className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 mb-4">Take a photo of your fridge or cupboard</p>
            <button
              onClick={scanFridge}
              className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              <Camera size={20} className="inline mr-2" />
              Scan Ingredients
            </button>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-700 font-medium mb-2">Detected ingredients:</p>
            <div className="flex flex-wrap gap-2">
              {['Eggs', 'Avocado', 'Bread', 'Tomatoes', 'Quinoa', 'Broccoli', 'Sweet potato', 'Chickpeas', 'Hummus', 'Bell peppers', 'Feta cheese', 'Olive oil'].map(item => (
                <span key={item} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700">
                  {item}
                </span>
              ))}
            </div>
            <button
              onClick={scanFridge}
              className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              <RefreshCw size={14} className="inline mr-1" />
              Rescan
            </button>
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
