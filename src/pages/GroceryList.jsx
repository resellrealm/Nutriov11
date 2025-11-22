import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Check,
  AlertCircle,
  DollarSign,
  Users,
  RefreshCw,
  TrendingUp,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateGroceryList, getUserGroceryLists, updateGroceryItem } from '../services/groceryListService';
import { getUserProfile } from '../services/userService';

const GroceryList = () => {
  const userId = useSelector(state => state.auth.user?.id);
  const [groceryLists, setGroceryLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const loadUserProfile = useCallback(async () => {
    const result = await getUserProfile(userId);
    if (result.success) {
      setUserProfile(result.data);
    }
  }, [userId]);

  const loadGroceryLists = useCallback(async () => {
    setIsLoading(true);
    const result = await getUserGroceryLists(userId);
    if (result.success) {
      setGroceryLists(result.data);
      if (result.data.length > 0) {
        setCurrentList(result.data[0]); // Most recent list
      }
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadGroceryLists();
      loadUserProfile();
    } else {
      // No user ID available, stop loading
      setIsLoading(false);
    }
  }, [userId, loadGroceryLists, loadUserProfile]);

  const handleGenerateList = async () => {
    if (!userProfile) {
      toast.error('Please complete your profile first');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateGroceryList(userId, userProfile);
      if (result.success) {
        toast.success('Grocery list generated successfully!');
        setCurrentList(result.data);
        setGroceryLists([result.data, ...groceryLists]);
      } else {
        toast.error(result.error || 'Failed to generate grocery list');
      }
    } catch {
      toast.error('An error occurred while generating the list');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleItem = async (itemId, checked) => {
    if (!currentList) return;

    const previousList = { ...currentList, items: [...currentList.items] };
    const optimisticUpdate = {
      ...currentList,
      items: currentList.items.map(item =>
        item.id === itemId ? { ...item, checked } : item
      )
    };
    setCurrentList(optimisticUpdate);
    const result = await updateGroceryItem(currentList.id, itemId, { checked });
    if (!result.success) {
      // Revert on error
      setCurrentList(previousList);
      toast.error('Failed to update item');
    }
  };

  // Group items by category
  const groupedItems = currentList?.items.reduce((groups, item) => {
    const category = item.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const categoryLabels = {
    produce: { label: 'Fresh Produce', icon: '🥬', color: 'green' },
    proteins: { label: 'Proteins', icon: '🍖', color: 'red' },
    dairy: { label: 'Dairy', icon: '🥛', color: 'blue' },
    grains_bread: { label: 'Grains & Bread', icon: '🌾', color: 'yellow' },
    pantry: { label: 'Pantry & Canned', icon: '🥫', color: 'orange' },
    frozen: { label: 'Frozen', icon: '❄️', color: 'cyan' },
    snacks: { label: 'Snacks', icon: '🍿', color: 'purple' },
    beverages: { label: 'Beverages', icon: '🥤', color: 'pink' },
    other: { label: 'Other', icon: '📦', color: 'gray' }
  };

  const calculateProgress = () => {
    if (!currentList || !currentList.items || currentList.items.length === 0) return 0;
    const checked = currentList.items.filter(item => item.checked).length;
    return (checked / currentList.items.length) * 100;
  };

  const getBudgetColor = (status) => {
    switch (status) {
      case 'under': return 'text-green-600 bg-green-50 border-green-200';
      case 'at': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'over': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading your grocery lists...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <ShoppingCart className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Grocery List</h1>
            <p className="text-sm text-gray-600">Smart shopping, budget-friendly</p>
          </div>
        </div>

        <button
          onClick={handleGenerateList}
          disabled={isGenerating}
          className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              <span>Generate New List</span>
            </>
          )}
        </button>
      </div>

      {!currentList ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Grocery List Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Generate your first personalized grocery list based on your meal plan, household size, and budget.
          </p>
          <button
            onClick={handleGenerateList}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Generate Grocery List</span>
          </button>
        </motion.div>
      ) : (
        <>
          {/* Budget & Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Cost */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Cost</span>
                <DollarSign className="text-primary" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                ${currentList.metadata?.totalEstimatedCost?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Budget: ${currentList.metadata?.budgetLimit?.toFixed(2)}
              </div>
            </div>

            {/* Household Size */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Household</span>
                <Users className="text-accent" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {currentList.metadata?.householdSize || 1}
              </div>
              <div className="text-xs text-gray-500 mt-1">people</div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Items</span>
                <Package className="text-green-500" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {currentList.metadata?.itemCount || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {currentList.items.filter(i => i.checked).length} checked
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Shopping Progress</span>
              <span className="text-sm text-gray-600">{calculateProgress().toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Budget Status */}
          {currentList.metadata?.budgetStatus && (
            <div className={`p-4 rounded-xl border-2 ${getBudgetColor(currentList.metadata.budgetStatus)}`}>
              <div className="flex items-start space-x-3">
                {currentList.metadata.budgetStatus === 'over' ? (
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                ) : (
                  <TrendingUp size={20} className="flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">
                    {currentList.metadata.budgetStatus === 'under' && 'Under Budget!'}
                    {currentList.metadata.budgetStatus === 'at' && 'On Budget'}
                    {currentList.metadata.budgetStatus === 'over' && 'Over Budget'}
                  </h4>
                  {currentList.warnings?.map((warning, idx) => (
                    <p key={idx} className="text-sm">{warning.message}</p>
                  ))}
                  {currentList.suggestions?.map((suggestion, idx) => (
                    <p key={idx} className="text-sm">{suggestion.message}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grouped Items by Category */}
          <div className="space-y-4">
            {Object.entries(groupedItems || {}).map(([category, items]) => {
              const categoryInfo = categoryLabels[category] || categoryLabels.other;
              const checkedCount = items.filter(i => i.checked).length;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className={`bg-${categoryInfo.color}-50 p-4 border-b-2 border-${categoryInfo.color}-100`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{categoryInfo.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800">{categoryInfo.label}</h3>
                          <p className="text-xs text-gray-600">
                            {checkedCount}/{items.length} items
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        ${items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Category Items */}
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          item.checked ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleItem(item.id, !item.checked)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              item.checked
                                ? 'bg-primary border-primary'
                                : 'border-gray-300 hover:border-primary'
                            }`}
                          >
                            {item.checked && <Check className="text-white" size={16} />}
                          </button>

                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className={`font-medium ${item.checked ? 'line-through' : 'text-gray-800'}`}>
                                  {item.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {item.quantity} {item.unit}
                                  {item.forMeals.length > 0 && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      • For: {item.forMeals.join(', ')}
                                    </span>
                                  )}
                                </p>
                                {item.alternativeSuggestion && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    💡 {item.alternativeSuggestion}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-800">
                                  ${item.estimatedPrice?.toFixed(2)}
                                </div>
                                {item.priority && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    item.priority === 'essential' ? 'bg-red-100 text-red-700' :
                                    item.priority === 'staple' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {item.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default GroceryList;
