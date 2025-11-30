import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Bell,
  Moon,
  Sun,
  Shield,
  Download,
  CreditCard,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronRight,
  CheckCircle,
  Trophy,
  Flame,
  Target,
  Camera,
  Loader,
  AlertCircle,
  FileJson,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserProfile, updateUserProfile, uploadProfilePhoto, deleteProfilePhoto } from '../services/userService';
import { getWeeklySummary, exportToCSV } from '../services/foodLogService';
import { getUserRecipes } from '../services/recipeService';
import { getUserAchievements } from '../services/achievementsService';

// Helper components defined outside of Account
const SettingSection = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 mb-4">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
    {children}
  </div>
);

const SettingItem = ({ icon: IconComponent, label, value, action, danger }) => (
  <div className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${danger ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}
    onClick={action}
  >
    <div className="flex items-center space-x-3">
      {IconComponent && <IconComponent className={`${danger ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} size={20} />}
      <span className={`font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      {value && <span className="text-sm text-gray-500 dark:text-gray-400">{value}</span>}
      <ChevronRight className="text-gray-400" size={18} />
    </div>
  </div>
);

const Account = () => {
  const userId = useSelector(state => state.auth.user?.id);
  const userEmail = useSelector(state => state.auth.user?.email);

  // UI State
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [profilePhotoURL, setProfilePhotoURL] = useState(null);

  // Profile data from Firestore
  const [userProfile, setUserProfile] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    age: '',
    weight: '',
    height: '',
    targetWeight: '',
    activityLevel: '',
    diet: '',
    gender: ''
  });

  // User stats
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    streak: 0,
    totalMealsLogged: 0,
    achievementsUnlocked: 0
  });

  // Load user profile from Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getUserProfile(userId);

        if (result.success && result.data) {
          setUserProfile(result.data);

          // Map Firestore data to form fields
          const profile = result.data;
          setProfileData({
            name: profile.basicInfo?.fullName || '',
            username: profile.basicInfo?.fullName?.toLowerCase().replace(/\s+/g, '_') || '',
            age: profile.basicInfo?.age || '',
            weight: profile.basicInfo?.currentWeight?.value || '',
            height: profile.basicInfo?.height?.value || '',
            targetWeight: profile.basicInfo?.targetWeight?.value || '',
            activityLevel: profile.goals?.activityLevel || '',
            diet: profile.dietary?.restrictions?.join(', ') || '',
            gender: profile.basicInfo?.gender || ''
          });

          // Set profile photo URL
          setProfilePhotoURL(profile.photoURL || null);

          // Load user stats
          loadUserStats();
        } else {
          toast.error('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  // Load user stats from various services
  const loadUserStats = async () => {
    try {
      // Get weekly summary for meal count and streak
      const weeklyResult = await getWeeklySummary(userId, new Date().toISOString().split('T')[0]);

      // Get achievements count
      const achievementsResult = await getUserAchievements(userId);

      if (weeklyResult.success) {
        setUserStats(prev => ({
          ...prev,
          totalMealsLogged: weeklyResult.data?.totalMeals || 0,
          streak: weeklyResult.data?.streak || 0,
          // Simple level calculation: level = totalMeals / 10
          level: Math.floor((weeklyResult.data?.totalMeals || 0) / 10) + 1,
          points: (weeklyResult.data?.totalMeals || 0) * 10
        }));
      }

      if (achievementsResult.success) {
        const unlockedCount = achievementsResult.data?.filter(a => a.unlocked).length || 0;
        setUserStats(prev => ({
          ...prev,
          achievementsUnlocked: unlockedCount
        }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Toggle dark mode (keep in localStorage as it's a UI preference)
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());

    if (newMode) {
      document.documentElement.classList.add('dark');
      toast.success('Dark mode enabled');
    } else {
      document.documentElement.classList.remove('dark');
      toast.success('Light mode enabled');
    }
  };

  // Save profile changes to Firestore
  const handleSaveProfile = async () => {
    if (!userId) {
      toast.error('User not logged in');
      return;
    }

    setIsSaving(true);
    try {
      // Map form fields to Firestore structure
      const updates = {
        basicInfo: {
          ...userProfile?.basicInfo,
          fullName: profileData.name,
          age: parseInt(profileData.age) || null,
          gender: profileData.gender,
          height: {
            value: parseFloat(profileData.height) || null,
            unit: 'cm'
          },
          currentWeight: {
            value: parseFloat(profileData.weight) || null,
            unit: 'kg'
          },
          targetWeight: {
            value: parseFloat(profileData.targetWeight) || null,
            unit: 'kg'
          }
        },
        goals: {
          ...userProfile?.goals,
          activityLevel: profileData.activityLevel
        },
        dietary: {
          ...userProfile?.dietary,
          restrictions: profileData.diet ? profileData.diet.split(',').map(d => d.trim()) : []
        }
      };

      const result = await updateUserProfile(userId, updates);

      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);

        // Reload profile
        const updatedProfile = await getUserProfile(userId);
        if (updatedProfile.success) {
          setUserProfile(updatedProfile.data);
        }
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const result = await uploadProfilePhoto(userId, file);
      if (result.success) {
        setProfilePhotoURL(result.data.url);
        toast.success('Profile photo uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle profile photo deletion
  const handlePhotoDelete = async () => {
    if (!profilePhotoURL) return;

    const confirmDelete = window.confirm('Are you sure you want to delete your profile photo?');
    if (!confirmDelete) return;

    setIsUploadingPhoto(true);
    try {
      const result = await deleteProfilePhoto(userId);
      if (result.success) {
        setProfilePhotoURL(null);
        toast.success('Profile photo deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Photo delete error:', error);
      toast.error('Failed to delete photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Export ALL data (profile + food logs + recipes + achievements)
  const handleExportAllData = async () => {
    if (!userId) {
      toast.error('User not logged in');
      return;
    }

    setIsExporting(true);
    try {
      // Get all user data
      const [profileResult, recipesResult, achievementsResult] = await Promise.all([
        getUserProfile(userId),
        getUserRecipes(userId),
        getUserAchievements(userId)
      ]);

      // Prepare export data
      const exportData = {
        profile: profileResult.success ? profileResult.data : null,
        recipes: recipesResult.success ? recipesResult.data : [],
        achievements: achievementsResult.success ? achievementsResult.data : [],
        stats: userStats,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      // Create JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutrio-complete-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('All data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Export food logs to CSV
  const handleExportFoodLogs = async () => {
    if (!userId) {
      toast.error('User not logged in');
      return;
    }

    setIsExporting(true);
    try {
      // Export last 90 days of food logs
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);

      const result = await exportToCSV(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (result.success) {
        // Create CSV file
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nutrio-food-logs-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Food logs exported successfully!');
      } else {
        toast.error(result.error || 'Failed to export food logs');
      }
    } catch (error) {
      console.error('Error exporting food logs:', error);
      toast.error('Failed to export food logs');
    } finally {
      setIsExporting(false);
    }
  };

  // Get subscription info from localStorage (temporary)
  const subscriptionTier = localStorage.getItem('planTier') || 'free';
  const scansThisMonth = parseInt(localStorage.getItem('scansThisMonth') || '0');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <User className="mr-3 text-primary" size={32} />
          Account Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your profile and preferences</p>
      </div>

      {/* Profile Card */}
      <SettingSection title="Profile">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
          {/* Avatar */}
          <div className="relative group">
            {profilePhotoURL ? (
              <img
                src={profilePhotoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-primary/20">
                {profileData.name?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || 'U'}
              </div>
            )}

            {/* Upload Button */}
            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
              {isUploadingPhoto ? (
                <Loader size={16} className="text-gray-600 dark:text-gray-300 animate-spin" />
              ) : (
                <Camera size={16} className="text-gray-600 dark:text-gray-300" />
              )}
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={isUploadingPhoto}
            />

            {/* Delete Button (only show if photo exists) */}
            {profilePhotoURL && !isUploadingPhoto && (
              <button
                onClick={handlePhotoDelete}
                className="absolute -top-1 -right-1 bg-red-500 p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete photo"
              >
                <X size={14} className="text-white" />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{profileData.name || 'User'}</h2>
            <p className="text-gray-600 dark:text-gray-400">@{profileData.username || 'username'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{userEmail}</p>

            <div className="flex items-center justify-center sm:justify-start space-x-4 mt-3">
              <div className="flex items-center space-x-1">
                <Trophy className="text-yellow-500" size={16} />
                <span className="text-sm font-medium">Level {userStats.level}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Flame className="text-orange-500" size={16} />
                <span className="text-sm font-medium">{userStats.streak} day streak</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="text-primary" size={16} />
                <span className="text-sm font-medium">{userStats.points} XP</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
          >
            {isEditing ? <X size={18} /> : <Edit2 size={18} />}
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t dark:border-gray-700 pt-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Gender</label>
                <select
                  value={profileData.gender}
                  onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Age</label>
                <input
                  type="number"
                  value={profileData.age}
                  onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profileData.weight}
                  onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profileData.height}
                  onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profileData.targetWeight}
                  onChange={(e) => setProfileData({ ...profileData, targetWeight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Activity Level</label>
                <select
                  value={profileData.activityLevel}
                  onChange={(e) => setProfileData({ ...profileData, activityLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select...</option>
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="very_active">Very Active (athlete)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Dietary Restrictions</label>
                <input
                  type="text"
                  value={profileData.diet}
                  onChange={(e) => setProfileData({ ...profileData, diet: e.target.value })}
                  placeholder="e.g., Vegetarian, Vegan, Gluten-free"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </SettingSection>

      {/* User Stats */}
      <SettingSection title="Your Stats">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.totalMealsLogged}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Meals Logged</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{userStats.streak}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Day Streak</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{userStats.achievementsUnlocked}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Achievements</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Level {userStats.level}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your Level</div>
          </div>
        </div>
      </SettingSection>

      {/* Subscription */}
      <SettingSection title="Subscription & Billing">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white capitalize">{subscriptionTier} Plan</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subscriptionTier === 'premium'
                  ? 'Unlimited scans & all features'
                  : `${scansThisMonth}/5 scans used this month`}
              </p>
            </div>
            {subscriptionTier === 'free' && (
              <button className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>

        {subscriptionTier === 'premium' ? (
          <SettingItem
            icon={CreditCard}
            label="Manage Subscription"
            value="£7.99/month"
            action={() => toast('Opening subscription management...')}
          />
        ) : (
          <div className="space-y-2">
            <SettingItem
              icon={CreditCard}
              label="Upgrade to Premium"
              value="£7.99/month"
              action={() => toast('Opening upgrade page...')}
            />
            <div className="pl-10 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-2">Premium includes:</p>
              <ul className="space-y-1.5">
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>Unlimited food scans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>AI-powered meal planning</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>Smart grocery list generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>Advanced nutrition analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>Complete history & data export</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>All achievements unlocked</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span>Ad-free experience</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Basic plan: 5 scans/month, limited meal suggestions
              </p>
            </div>
          </div>
        )}
      </SettingSection>

      {/* Appearance */}
      <SettingSection title="Appearance">
        <div className="flex items-center justify-between p-3 rounded-lg">
          <div className="flex items-center space-x-3">
            {darkMode ? <Moon className="text-gray-500 dark:text-gray-400" size={20} /> : <Sun className="text-gray-500" size={20} />}
            <span className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications">
        <SettingItem
          icon={Bell}
          label="Push Notifications"
          value="Enabled"
          action={() => toast('Opening notification settings...')}
        />
        <SettingItem
          icon={Mail}
          label="Email Notifications"
          value="Disabled"
          action={() => toast('Opening email settings...')}
        />
      </SettingSection>

      {/* Privacy & Security */}
      <SettingSection title="Privacy & Security">
        <SettingItem
          icon={Lock}
          label="Change Password"
          action={() => toast('Opening password change...')}
        />
        <SettingItem
          icon={Shield}
          label="Privacy Settings"
          action={() => toast('Opening privacy settings...')}
        />
      </SettingSection>

      {/* Data & Storage */}
      <SettingSection title="Data & Storage">
        <SettingItem
          icon={FileJson}
          label="Export All Data (JSON)"
          action={handleExportAllData}
        />
        <SettingItem
          icon={FileText}
          label="Export Food Logs (CSV)"
          action={handleExportFoodLogs}
        />
        <SettingItem
          icon={Trash2}
          label="Delete Account"
          danger
          action={() => toast.error('Please contact support to delete your account')}
        />
      </SettingSection>

      {/* App Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 mt-4">
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Nutrio v1.0.0</p>
          <p className="mt-2">Made with care by the Nutrio Team</p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
