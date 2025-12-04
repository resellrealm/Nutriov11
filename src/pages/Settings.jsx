import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, Bell, Moon, Globe, Shield, Database,
  Download, Trash2, LogOut, ChevronRight, Check, X, Loader,
  AlertCircle, Save, User, Mail, Lock, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { logout } from '../store/authSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector(state => state.auth.user?.id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [units, setUnits] = useState('metric'); // metric or imperial
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    mealReminders: true,
    waterReminders: true,
    goalAchievements: true,
    weeklyReports: true,
    exerciseReminders: false
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showProgress: true,
    allowDataCollection: true
  });

  // User Profile
  const [userProfile, setUserProfile] = useState(null);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const result = await getUserProfile(userId);
        if (result.success) {
          setUserProfile(result.data);

          // Load user preferences
          if (result.data.preferences) {
            setUnits(result.data.preferences.units || 'metric');
            setLanguage(result.data.preferences.language || 'en');
            if (result.data.preferences.notifications) {
              setNotifications(result.data.preferences.notifications);
            }
            if (result.data.preferences.privacy) {
              setPrivacy(result.data.preferences.privacy);
            }
          }
        }
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', newValue.toString());

    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    toast.success(newValue ? 'Dark mode enabled' : 'Light mode enabled');
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updatedPreferences = {
        preferences: {
          units,
          language,
          notifications,
          privacy
        }
      };

      const result = await updateUserProfile(userId, updatedPreferences);

      if (result.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    toast.success('Exporting your data...');
    // In a real app, this would trigger a backend job to compile and email the data
    setTimeout(() => {
      toast.success('Export complete! Check your email.');
      setShowExportModal(false);
    }, 2000);
  };

  const handleDeleteAccount = async () => {
    toast.error('Account deletion is not yet implemented');
    setShowDeleteModal(false);
    // In a real app, this would trigger account deletion
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  const SettingSection = ({ icon: Icon, title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <Icon className="mr-3 text-primary" size={24} />
        {title}
      </h2>
      {children}
    </motion.div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectOption = ({ value, onChange, options, label }) => (
    <div className="py-3">
      <label className="block font-medium text-gray-900 dark:text-white mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <SettingsIcon className="mr-3 text-primary" size={32} />
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your app preferences and account settings
        </p>
      </div>

      {/* Appearance */}
      <SettingSection icon={Moon} title="Appearance">
        <ToggleSwitch
          enabled={darkMode}
          onChange={handleDarkModeToggle}
          label="Dark Mode"
          description="Toggle between light and dark themes"
        />
      </SettingSection>

      {/* Preferences */}
      <SettingSection icon={Globe} title="Preferences">
        <SelectOption
          value={units}
          onChange={setUnits}
          label="Units of Measurement"
          options={[
            { value: 'metric', label: 'Metric (kg, cm)' },
            { value: 'imperial', label: 'Imperial (lbs, inches)' }
          ]}
        />
        <SelectOption
          value={language}
          onChange={setLanguage}
          label="Language"
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' }
          ]}
        />
      </SettingSection>

      {/* Notifications */}
      <SettingSection icon={Bell} title="Notifications">
        <ToggleSwitch
          enabled={notifications.mealReminders}
          onChange={() => setNotifications({...notifications, mealReminders: !notifications.mealReminders})}
          label="Meal Reminders"
          description="Get reminded to log your meals"
        />
        <ToggleSwitch
          enabled={notifications.waterReminders}
          onChange={() => setNotifications({...notifications, waterReminders: !notifications.waterReminders})}
          label="Water Reminders"
          description="Stay hydrated with regular reminders"
        />
        <ToggleSwitch
          enabled={notifications.exerciseReminders}
          onChange={() => setNotifications({...notifications, exerciseReminders: !notifications.exerciseReminders})}
          label="Exercise Reminders"
          description="Get reminded to log your workouts"
        />
        <ToggleSwitch
          enabled={notifications.goalAchievements}
          onChange={() => setNotifications({...notifications, goalAchievements: !notifications.goalAchievements})}
          label="Goal Achievements"
          description="Celebrate when you hit your goals"
        />
        <ToggleSwitch
          enabled={notifications.weeklyReports}
          onChange={() => setNotifications({...notifications, weeklyReports: !notifications.weeklyReports})}
          label="Weekly Reports"
          description="Receive weekly progress summaries"
        />
      </SettingSection>

      {/* Privacy & Security */}
      <SettingSection icon={Shield} title="Privacy & Security">
        <ToggleSwitch
          enabled={privacy.profilePublic}
          onChange={() => setPrivacy({...privacy, profilePublic: !privacy.profilePublic})}
          label="Public Profile"
          description="Make your profile visible to other users"
        />
        <ToggleSwitch
          enabled={privacy.showProgress}
          onChange={() => setPrivacy({...privacy, showProgress: !privacy.showProgress})}
          label="Show Progress Photos"
          description="Allow others to see your progress photos"
        />
        <ToggleSwitch
          enabled={privacy.allowDataCollection}
          onChange={() => setPrivacy({...privacy, allowDataCollection: !privacy.allowDataCollection})}
          label="Anonymous Analytics"
          description="Help us improve by sharing anonymous usage data"
        />
      </SettingSection>

      {/* Data Management */}
      <SettingSection icon={Database} title="Data Management">
        <button
          onClick={() => setShowExportModal(true)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <div className="flex items-center">
            <Download className="mr-3 text-emerald-500" size={20} />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Export My Data</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Download all your data in JSON format
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition mt-2"
        >
          <div className="flex items-center">
            <Trash2 className="mr-3 text-red-500" size={20} />
            <div className="text-left">
              <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permanently delete your account and all data
              </p>
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </button>
      </SettingSection>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? (
            <>
              <Loader className="animate-spin mr-2" size={20} />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2" size={20} />
              Save Settings
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="flex-1 sm:flex-none bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center"
        >
          <LogOut className="mr-2" size={20} />
          Logout
        </button>
      </div>

      {/* Export Data Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Export Data</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We'll compile all your data and send it to your email address within 24 hours.
                This includes your profile, food logs, exercise logs, progress photos, and all other data.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleExportData}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition"
                >
                  Export Data
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Delete Account</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-6">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Are you sure you want to delete your account? This action cannot be undone.
                  All your data including food logs, progress photos, and achievements will be permanently deleted.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 transition"
                >
                  Delete Account
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
