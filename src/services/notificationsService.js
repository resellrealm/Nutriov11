import { db, isFirebaseFullyInitialized } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  ERROR_CODES,
  mapFirestoreErrorCode,
  createErrorResponse
} from '../utils/errorCodes';

// Helper to check if Firestore is available
const checkFirestoreConfig = () => {
  if (!isFirebaseFullyInitialized || !db) {
    return createErrorResponse(ERROR_CODES.DB_UNAVAILABLE,
      'Database is not configured. Please check your Firebase setup.');
  }
  return null;
};

/**
 * Notifications Service
 * Manages user notification preferences and sends browser notifications
 */

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: false,
  mealReminders: {
    enabled: false,
    breakfast: { enabled: true, time: '08:00' },
    lunch: { enabled: true, time: '12:00' },
    dinner: { enabled: true, time: '18:00' },
    snack: { enabled: false, time: '15:00' }
  },
  waterReminders: {
    enabled: false,
    intervalMinutes: 120, // Every 2 hours
    startTime: '08:00',
    endTime: '20:00'
  },
  dailyLogging: {
    enabled: false,
    time: '20:00', // Reminder to log meals at end of day
    message: "Don't forget to log your meals today!"
  },
  achievementAlerts: {
    enabled: true // Show notifications when achievements are unlocked
  },
  goalAlerts: {
    enabled: true // Show notifications when goals are reached
  }
};

/**
 * Get user's notification settings
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with notification settings
 */
export const getNotificationSettings = async (userId) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const notifRef = doc(db, 'users', userId, 'settings', 'notifications');
    const notifSnap = await getDoc(notifRef);

    if (notifSnap.exists()) {
      return {
        success: true,
        data: notifSnap.data()
      };
    } else {
      // Return default settings if none exist
      return {
        success: true,
        data: DEFAULT_NOTIFICATION_SETTINGS
      };
    }
  } catch (error) {
    const errorCode = mapFirestoreErrorCode(error.code);
    return createErrorResponse(errorCode,
      `Failed to get notification settings: ${error.message}`,
      error);
  }
};

/**
 * Update user's notification settings
 * @param {string} userId - User ID
 * @param {Object} settings - Notification settings to update
 * @returns {Promise<Object>} Result
 */
export const updateNotificationSettings = async (userId, settings) => {
  const configError = checkFirestoreConfig();
  if (configError) return configError;

  try {
    const notifRef = doc(db, 'users', userId, 'settings', 'notifications');
    await setDoc(notifRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return {
      success: true,
      message: 'Notification settings updated successfully'
    };
  } catch (error) {
    const errorCode = mapFirestoreErrorCode(error.code);
    return createErrorResponse(errorCode,
      `Failed to update notification settings: ${error.message}`,
      error);
  }
};

/**
 * Request browser notification permission
 * @returns {Promise<string>} Permission status ('granted', 'denied', 'default')
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

/**
 * Send a browser notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export const sendBrowserNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  const defaultOptions = {
    icon: '/icon-192x192.png',
    badge: '/icon-badge.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    ...options
  };

  return new Notification(title, defaultOptions);
};

/**
 * Schedule meal reminder notifications
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result
 */
export const scheduleMealReminders = async (userId) => {
  const result = await getNotificationSettings(userId);
  if (!result.success || !result.data.mealReminders.enabled) {
    return { success: false, error: 'Meal reminders not enabled' };
  }

  const { mealReminders } = result.data;
  const now = new Date();
  const scheduled = [];

  // Schedule each enabled meal reminder
  Object.entries(mealReminders).forEach(([mealType, config]) => {
    if (typeof config === 'object' && config.enabled) {
      const [hours, minutes] = config.time.split(':');
      const reminderTime = new Date();
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (reminderTime < now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const timeUntilReminder = reminderTime - now;

      setTimeout(() => {
        sendBrowserNotification(`Time for ${mealType}!`, {
          body: `Don't forget to log your ${mealType}.`,
          tag: `meal-reminder-${mealType}`,
          data: { type: 'meal-reminder', mealType }
        });
      }, timeUntilReminder);

      scheduled.push({
        mealType,
        scheduledFor: reminderTime.toISOString(),
        timeUntilReminder
      });
    }
  });

  return {
    success: true,
    data: { scheduled, count: scheduled.length }
  };
};

/**
 * Schedule water reminder notifications
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result
 */
export const scheduleWaterReminders = async (userId) => {
  const result = await getNotificationSettings(userId);
  if (!result.success || !result.data.waterReminders.enabled) {
    return { success: false, error: 'Water reminders not enabled' };
  }

  const { waterReminders } = result.data;
  const intervalMs = waterReminders.intervalMinutes * 60 * 1000;

  // Set up recurring water reminders
  const intervalId = setInterval(() => {
    const now = new Date();
    const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Check if we're within the active time window
    if (currentTime >= waterReminders.startTime && currentTime <= waterReminders.endTime) {
      sendBrowserNotification('💧 Time to hydrate!', {
        body: 'Remember to drink some water.',
        tag: 'water-reminder',
        data: { type: 'water-reminder' }
      });
    }
  }, intervalMs);

  return {
    success: true,
    data: { intervalId, intervalMs }
  };
};

/**
 * Send achievement notification
 * @param {string} achievementName - Name of achievement unlocked
 * @param {string} description - Achievement description
 */
export const notifyAchievementUnlocked = (achievementName, description) => {
  sendBrowserNotification(`🏆 Achievement Unlocked!`, {
    body: `${achievementName} - ${description}`,
    tag: 'achievement',
    requireInteraction: true,
    data: { type: 'achievement', name: achievementName }
  });
};

/**
 * Send goal reached notification
 * @param {string} goalType - Type of goal (e.g., 'calories', 'protein')
 * @param {number} value - Goal value reached
 */
export const notifyGoalReached = (goalType, value) => {
  sendBrowserNotification(`🎯 Goal Reached!`, {
    body: `You've hit your ${goalType} goal of ${value}!`,
    tag: 'goal',
    data: { type: 'goal', goalType, value }
  });
};

/**
 * Send daily logging reminder
 * @param {string} userId - User ID
 */
export const sendDailyLoggingReminder = async (userId) => {
  const result = await getNotificationSettings(userId);
  if (!result.success || !result.data.dailyLogging.enabled) {
    return { success: false, error: 'Daily logging reminder not enabled' };
  }

  const { dailyLogging } = result.data;
  sendBrowserNotification('📝 Daily Reminder', {
    body: dailyLogging.message,
    tag: 'daily-logging',
    data: { type: 'daily-logging' }
  });

  return { success: true };
};

/**
 * Clear all scheduled notifications
 * @param {Array<number>} intervalIds - Array of interval IDs to clear
 */
export const clearAllNotifications = (intervalIds = []) => {
  intervalIds.forEach(id => clearInterval(id));
  return { success: true };
};

export default {
  getNotificationSettings,
  updateNotificationSettings,
  requestNotificationPermission,
  sendBrowserNotification,
  scheduleMealReminders,
  scheduleWaterReminders,
  notifyAchievementUnlocked,
  notifyGoalReached,
  sendDailyLoggingReminder,
  clearAllNotifications
};
