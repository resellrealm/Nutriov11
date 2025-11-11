import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Book, 
  Utensils, 
  Calendar,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  Users,
  ChefHat,
  Star,
  Link2,
  Camera,
  Upload,
  X,
  Save,
  Copy,
  Share2,
  Timer,
  ShoppingCart,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const Favourites = () => {
  const [activeTab, setActiveTab] = useState('favourites');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [addMethod, setAddMethod] = useState('scan'); // scan, link, manual

  // Sample data (would come from backend)
  const [favourites, setFavourites] = useState([
    {
      id: 1,
      name: 'Green Power Smoothie',
      description: 'Protein-packed breakfast smoothie with spinach and banana',
      image: '/api/placeholder/300/200',
      category: 'breakfast',
      calories: 320,
      protein: 25,
      cookTime: '5 min',
      difficulty: 'Easy',
      rating: 4.5,
      tags: ['vegetarian', 'quick', 'healthy'],
      source: 'analyzed',
      lastMade: '2 days ago',
      timesCooked: 12
    },
    {
      id: 2,
      name: 'Thai Chicken Curry',
      description: 'Authentic Thai green curry from Jamie Oliver cookbook',
      image: '/api/placeholder/300/200',
      category: 'dinner',
      calories: 450,
      protein: 35,
      cookTime: '30 min',
      difficulty: 'Medium',
      rating: 5,
      tags: ['thai', 'spicy', 'gluten-free'],
      source: 'cookbook',
      cookbook: "Jamie Oliver's Thai Kitchen",
      page: 47,
      lastMade: '1 week ago',
      timesCooked: 5
    },
    {
      id: 3,
      name: 'Quinoa Buddha Bowl',
      description: 'Colorful veggie bowl with tahini dressing',
      image: '/api/placeholder/300/200',
      category: 'lunch',
      calories: 380,
      protein: 18,
      cookTime: '20 min',
      difficulty: 'Easy',
      rating: 4,
      tags: ['vegan', 'meal-prep', 'healthy'],
      source: 'online',
      url: 'https://example.com/buddha-bowl',
      lastMade: '3 days ago',
      timesCooked: 8
    },
    {
      id: 4,
      name: 'Overnight Oats',
      description: 'Easy breakfast prep with berries and almond butter',
      image: '/api/placeholder/300/200',
      category: 'breakfast',
      calories: 280,
      protein: 12,
      cookTime: '5 min prep',
      difficulty: 'Easy',
      rating: 4.5,
      tags: ['vegetarian', 'meal-prep', 'no-cook'],
      source: 'manual',
      lastMade: 'Yesterday',
      timesCooked: 20
    },
    {
      id: 5,
      name: 'Mediterranean Salmon',
      description: 'Pan-seared salmon with olives and tomatoes',
      image: '/api/placeholder/300/200',
      category: 'dinner',
      calories: 420,
      protein: 38,
      cookTime: '25 min',
      difficulty: 'Medium',
      rating: 5,
      tags: ['pescatarian', 'mediterranean', 'omega-3'],
      source: 'cookbook',
      cookbook: "The Mediterranean Diet Cookbook",
      page: 112,
      lastMade: '5 days ago',
      timesCooked: 7
    }
  ]);

  const tabs = [
    { id: 'favourites', name: 'Favourite Meals', icon: Heart, count: favourites.length },
    { id: 'cookbook', name: 'Cookbook Recipes', icon: Book, count: favourites.filter(f => f.source === 'cookbook').length },
    { id: 'mealplan', name: 'Meal Plans', icon: Calendar, count: 3 }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: Utensils },
    { id: 'breakfast', name: 'Breakfast', icon: "☕" },
    { id: 'lunch', name: 'Lunch', icon: "🥗" },
    { id: 'dinner', name: 'Dinner', icon: "🍽️" },
    { id: 'snacks', name: 'Snacks', icon: "🍿" }
  ];

  // Filter favourites based on tab, search, and category
  const filteredFavourites = favourites.filter(item => {
    const matchesTab = 
      activeTab === 'favourites' ? true :
      activeTab === 'cookbook' ? item.source === 'cookbook' :
      activeTab === 'mealplan' ? false : true;
    
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = 
      selectedFilter === 'all' || item.category === selectedFilter;
    
    return matchesTab && matchesSearch && matchesFilter;
  });

  const RecipeCard = ({ recipe }) => {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => setSelectedRecipe(recipe)}
      >
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20">
          {recipe.image && (
            <img 
              src={recipe.image} 
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
            <Star className="text-yellow-500 fill-yellow-500" size={14} />
            <span className="text-sm font-semibold">{recipe.rating}</span>
          </div>
          {recipe.source === 'cookbook' && (
            <div className="absolute top-3 left-3 bg-primary/90 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
              <Book size={14} />
              <span className="text-xs">Cookbook</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1">{recipe.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Clock size={14} className="mr-1" />
                {recipe.cookTime}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                {recipe.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-xs">{recipe.timesCooked}x cooked</span>
            </div>
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
            <p className="text-xs text-gray-500">{recipe.lastMade}</p>
          </div>
          
          {recipe.tags && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
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
      difficulty: 'Medium'
    });

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
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Add Recipe</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Method Selection */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">How would you like to add?</label>
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
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`mx-auto mb-2 ${
                            addMethod === method.id ? 'text-primary' : 'text-gray-600'
                          }`} size={24} />
                          <p className="text-sm font-medium text-gray-700">{method.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Scan Cookbook */}
                {addMethod === 'scan' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <Camera className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-600 mb-4">Take a photo of your cookbook page</p>
                      <button className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                        <Camera size={20} className="inline mr-2" />
                        Open Camera
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Cookbook name"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="Page number"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
                
                {/* Import from URL */}
                {addMethod === 'link' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Recipe URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/recipe"
                        value={recipeData.url}
                        onChange={(e) => setRecipeData({ ...recipeData, url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all">
                      <Upload size={20} className="inline mr-2" />
                      Import Recipe
                    </button>
                  </div>
                )}
                
                {/* Manual Entry */}
                {addMethod === 'manual' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Recipe Name</label>
                      <input
                        type="text"
                        value={recipeData.name}
                        onChange={(e) => setRecipeData({ ...recipeData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                      <textarea
                        rows="2"
                        value={recipeData.description}
                        onChange={(e) => setRecipeData({ ...recipeData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Servings</label>
                        <input
                          type="number"
                          value={recipeData.servings}
                          onChange={(e) => setRecipeData({ ...recipeData, servings: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Cook Time</label>
                        <input
                          type="text"
                          placeholder="30 min"
                          value={recipeData.cookTime}
                          onChange={(e) => setRecipeData({ ...recipeData, cookTime: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Difficulty</label>
                        <select
                          value={recipeData.difficulty}
                          onChange={(e) => setRecipeData({ ...recipeData, difficulty: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Ingredients</label>
                      <textarea
                        rows="4"
                        placeholder="Enter each ingredient on a new line"
                        value={recipeData.ingredients}
                        onChange={(e) => setRecipeData({ ...recipeData, ingredients: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Instructions</label>
                      <textarea
                        rows="4"
                        placeholder="Enter step-by-step instructions"
                        value={recipeData.instructions}
                        onChange={(e) => setRecipeData({ ...recipeData, instructions: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      toast.success('Recipe added successfully! 📖');
                      setShowAddModal(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    <Save size={20} className="inline mr-2" />
                    Save Recipe
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
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
              className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20">
                {selectedRecipe.image && (
                  <img 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedRecipe.name}</h2>
                    <p className="text-gray-600">{selectedRecipe.description}</p>
                  </div>
                  <div className="flex items-center space-x-1 bg-yellow-100 px-3 py-1 rounded-lg">
                    <Star className="text-yellow-500 fill-yellow-500" size={16} />
                    <span className="font-semibold">{selectedRecipe.rating}</span>
                  </div>
                </div>
                
                {selectedRecipe.source === 'cookbook' && (
                  <div className="bg-primary/10 rounded-lg p-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="text-primary" size={20} />
                      <div>
                        <p className="font-medium text-gray-800">{selectedRecipe.cookbook}</p>
                        <p className="text-sm text-gray-600">Page {selectedRecipe.page}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{selectedRecipe.calories}</p>
                    <p className="text-sm text-gray-600">Calories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{selectedRecipe.protein}g</p>
                    <p className="text-sm text-gray-600">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800">{selectedRecipe.cookTime}</p>
                    <p className="text-sm text-gray-600">Cook Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800">{selectedRecipe.difficulty}</p>
                    <p className="text-sm text-gray-600">Difficulty</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp className="text-green-500" size={16} />
                    <span>Cooked {selectedRecipe.timesCooked} times</span>
                    <span className="text-gray-400">•</span>
                    <span>Last made {selectedRecipe.lastMade}</span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                    <Plus size={20} className="inline mr-2" />
                    Add to Today
                  </button>
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                    <Timer size={20} />
                  </button>
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                    <ShoppingCart size={20} />
                  </button>
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Heart className="mr-3 text-red-500" size={32} />
              My Favourites
            </h1>
            <p className="text-gray-600 mt-2">Your saved recipes and meal collections</p>
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
      <div className="bg-white rounded-xl shadow-sm p-1 mb-6">
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
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span>{tab.name}</span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex space-x-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedFilter === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      {activeTab !== 'mealplan' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavourites.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card p-8 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Meal Plans Coming Soon!</h3>
          <p className="text-gray-600">Plan your weekly meals and generate shopping lists automatically.</p>
        </div>
      )}

      {/* Empty State */}
      {filteredFavourites.length === 0 && activeTab !== 'mealplan' && (
        <div className="bg-white rounded-xl shadow-card p-8 text-center">
          <Heart className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
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
