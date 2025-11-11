import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSS class merger
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format time
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate days between dates
export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

// Get greeting based on time of day
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Calculate BMI
export const calculateBMI = (weight, height) => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// Calculate TDEE (Total Daily Energy Expenditure)
export const calculateTDEE = (weight, height, age, gender, activityLevel) => {
  // Using Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
    extra: 1.9,
  };
  
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
};

// Calculate macros based on goals
export const calculateMacros = (calories, goal) => {
  let proteinPercent, carbsPercent, fatsPercent;
  
  switch (goal) {
    case 'lose-weight':
      proteinPercent = 0.30;
      carbsPercent = 0.40;
      fatsPercent = 0.30;
      break;
    case 'gain-muscle':
      proteinPercent = 0.30;
      carbsPercent = 0.50;
      fatsPercent = 0.20;
      break;
    case 'maintain':
      proteinPercent = 0.25;
      carbsPercent = 0.50;
      fatsPercent = 0.25;
      break;
    default:
      proteinPercent = 0.25;
      carbsPercent = 0.50;
      fatsPercent = 0.25;
  }
  
  return {
    protein: Math.round((calories * proteinPercent) / 4), // 4 cal per gram
    carbs: Math.round((calories * carbsPercent) / 4),
    fats: Math.round((calories * fatsPercent) / 9), // 9 cal per gram
  };
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get random item from array
export const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if date is today
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// Get day of week
export const getDayOfWeek = (date = new Date()) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(date).getDay()];
};

// Calculate streak
export const calculateStreak = (dates) => {
  if (!dates || dates.length === 0) return 0;
  
  const sortedDates = dates.sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let currentDate = new Date();
  
  for (const date of sortedDates) {
    const checkDate = new Date(date);
    const dayDiff = daysBetween(currentDate, checkDate);
    
    if (dayDiff === 0 || dayDiff === 1) {
      streak++;
      currentDate = checkDate;
    } else {
      break;
    }
  }
  
  return streak;
};

// Get level from XP
export const getLevelFromXP = (xp) => {
  return Math.floor(xp / 100) + 1;
};

// Get XP needed for next level
export const getXPForNextLevel = (currentXP) => {
  const currentLevel = getLevelFromXP(currentXP);
  return currentLevel * 100;
};

// Get level title
export const getLevelTitle = (level) => {
  if (level < 5) return 'Nutrition Newbie';
  if (level < 10) return 'Meal Master';
  if (level < 15) return 'Macro Guru';
  if (level < 20) return 'Wellness Warrior';
  return 'Nutrition Legend';
};

// Storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Validate email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Get contrast color (black or white) for given background color
export const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};
