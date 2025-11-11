import React, { useState, useEffect } from 'react';
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
  Settings as SettingsIcon,
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
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

const Account = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    targetWeight: '',
    activityLevel: '',
    diet: '',
  });

  // Load user data from localStorage
  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setDarkMode(darkModePreference);
    
    setProfileData({
      name: localStorage.getItem('userName') || '',
      username: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      age: localStorage.getItem('userAge') || '',
      weight: localStorage.getItem('userWeight') || '',
      height: localStorage.getItem('userHeight') || '',
      targetWeight: localStorage.getItem('targetWeight') || '',
      activityLevel: localStorage.getItem('activityLevel') || '',
      diet: localStorage.getItem('userDiet') || '',
    });
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      toast.success('Dark mode enabled 🌙');
    } else {
      document.documentElement.classList.remove('dark');
      toast.success('Light mode enabled ☀️');
    }
  };

  // Save profile changes
  const handleSaveProfile = () => {
    localStorage.setItem('userName', profileData.name);
    localStorage.setItem('userEmail', profileData.email);
    localStorage.setItem('userAge', profileData.age);
    localStorage.setItem('userWeight', profileData.weight);
    localStorage.setItem('userHeight', profileData.height);
    localStorage.setItem('targetWeight', profileData.targetWeight);
    localStorage.setItem('activityLevel', profileData.activityLevel);
    localStorage.setItem('userDiet', profileData.diet);
    
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  // Get subscription info
  const subscriptionTier = localStorage.getItem('subscriptionTier') || 'free';
  const scansThisMonth = parseInt(localStorage.getItem('scansThisMonth') || '0');
  const userLevel = localStorage.getItem('userLevel') || '1';
  const userPoints = localStorage.getItem('userPoints') || '0';
  const userStreak = localStorage.getItem('userStreak') || '0';

  // Export data
  const handleExportData = () => {
    const data = {
      profile: profileData,
      stats: {
        level: userLevel,
        points: userPoints,
        streak: userStreak,
      },
      subscription: subscriptionTier,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrio-data-${Date.now()}.json`;
    a.click();
    
    toast.success('Data exported successfully!');
  };

  const SettingSection = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );

  const SettingItem = ({ icon: Icon, label, value, action, danger }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${danger ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}
      onClick={action}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`${danger ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} size={20} />
        <span className={`font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {value && <span className="text-sm text-gray-500 dark:text-gray-400">{value}</span>}
        <ChevronRight className="text-gray-400" size={18} />
      </div>
    </div>
  );

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
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profileData.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Camera size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{profileData.name || 'User'}</h2>
            <p className="text-gray-600 dark:text-gray-400">@{profileData.username || 'username'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{profileData.email}</p>
            
            <div className="flex items-center justify-center sm:justify-start space-x-4 mt-3">
              <div className="flex items-center space-x-1">
                <Trophy className="text-yellow-500" size={16} />
                <span className="text-sm font-medium">Level {userLevel}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Flame className="text-orange-500" size={16} />
                <span className="text-sm font-medium">{userStreak} day streak</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="text-primary" size={16} />
                <span className="text-sm font-medium">{userPoints} XP</span>
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
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
                  value={profileData.weight}
                  onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Height (cm)</label>
                <input
                  type="number"
                  value={profileData.height}
                  onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Target Weight (kg)</label>
                <input
                  type="number"
                  value={profileData.targetWeight}
                  onChange={(e) => setProfileData({ ...profileData, targetWeight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </motion.div>
        )}
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
              <p className="font-medium mb-1">Premium includes:</p>
              <ul className="space-y-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Unlimited food scans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Full meal planner access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Complete history & data export</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>All achievements unlocked</span>
                </li>
              </ul>
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
          icon={Download} 
          label="Export My Data" 
          action={handleExportData}
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
          <p className="mt-2">Made with 💚 by the Nutrio Team</p>
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
