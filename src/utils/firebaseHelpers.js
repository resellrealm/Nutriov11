import { db, isFirebaseFullyInitialized } from '../config/firebase';
import { ERROR_CODES, createErrorResponse } from './errorCodes';

/**
 * Firebase/Firestore Helper Utilities
 * Shared helper functions for Firebase/Firestore configuration checks
 */

/**
 * Check if Firestore is properly configured and available
 * @returns {Object|null} Error response if unavailable, null if available
 */
export const checkFirestoreConfig = () => {
  if (!isFirebaseFullyInitialized || !db) {
    return createErrorResponse(ERROR_CODES.DB_UNAVAILABLE,
      'Database is not configured. Please check your Firebase setup.');
  }
  return null;
};
