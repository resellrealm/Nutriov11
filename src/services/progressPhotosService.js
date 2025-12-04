import { db, storage, isFirebaseFullyInitialized } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  ERROR_CODES,
  mapFirestoreErrorCode,
  createErrorResponse
} from '../utils/errorCodes';

/**
 * Progress Photos Service
 * Handles uploading and managing progress photos
 */

// Helper to check if Firebase is available
const checkFirebaseConfig = () => {
  if (!isFirebaseFullyInitialized || !db || !storage) {
    return createErrorResponse(ERROR_CODES.DB_UNAVAILABLE,
      'Firebase is not configured. Please check your Firebase setup.');
  }
  return null;
};

/**
 * Upload a progress photo
 */
export const uploadProgressPhoto = async (userId, file, metadata = {}) => {
  const configError = checkFirebaseConfig();
  if (configError) return configError;

  try {
    // Validate file
    if (!file) {
      return createErrorResponse(ERROR_CODES.INVALID_INPUT, 'No file provided');
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return createErrorResponse(ERROR_CODES.INVALID_INPUT, 'File size must be less than 10MB');
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return createErrorResponse(ERROR_CODES.INVALID_INPUT, 'File must be an image');
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `progressPhotos/${userId}/${filename}`);

    // Upload file
    await uploadBytes(storageRef, file);

    // Get download URL
    const photoUrl = await getDownloadURL(storageRef);

    // Save metadata to Firestore
    const photoEntry = {
      userId,
      photoUrl,
      filename,
      date: metadata.date || new Date().toISOString().split('T')[0],
      weight: metadata.weight || null,
      notes: metadata.notes || '',
      measurements: {
        chest: metadata.measurements?.chest || null,
        waist: metadata.measurements?.waist || null,
        hips: metadata.measurements?.hips || null,
        arms: metadata.measurements?.arms || null,
        thighs: metadata.measurements?.thighs || null
      },
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'progressPhotos'), photoEntry);

    return {
      success: true,
      data: {
        id: docRef.id,
        ...photoEntry
      }
    };
  } catch (error) {
    console.error('Error uploading progress photo:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get all progress photos for a user
 */
export const getProgressPhotos = async (userId) => {
  const configError = checkFirebaseConfig();
  if (configError) return configError;

  try {
    const q = query(
      collection(db, 'progressPhotos'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const photos = [];

    querySnapshot.forEach((doc) => {
      photos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      data: photos
    };
  } catch (error) {
    console.error('Error getting progress photos:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Delete a progress photo
 */
export const deleteProgressPhoto = async (photoId, userId, filename) => {
  const configError = checkFirebaseConfig();
  if (configError) return configError;

  try {
    // Delete from Storage
    if (filename) {
      const storageRef = ref(storage, `progressPhotos/${userId}/${filename}`);
      try {
        await deleteObject(storageRef);
      } catch (storageError) {
        console.warn('Error deleting file from storage (may not exist):', storageError);
      }
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'progressPhotos', photoId));

    return {
      success: true,
      data: { id: photoId }
    };
  } catch (error) {
    console.error('Error deleting progress photo:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get progress summary (weight changes, photo count, etc.)
 */
export const getProgressSummary = async (userId) => {
  const configError = checkFirebaseConfig();
  if (configError) return configError;

  try {
    const photosResult = await getProgressPhotos(userId);

    if (!photosResult.success) {
      return photosResult;
    }

    const photos = photosResult.data;
    const photosWithWeight = photos.filter(p => p.weight !== null && p.weight !== undefined);

    let weightChange = null;
    let startWeight = null;
    let currentWeight = null;

    if (photosWithWeight.length >= 2) {
      // Sort by date ascending to get start and current
      const sorted = [...photosWithWeight].sort((a, b) => a.date.localeCompare(b.date));
      startWeight = sorted[0].weight;
      currentWeight = sorted[sorted.length - 1].weight;
      weightChange = currentWeight - startWeight;
    } else if (photosWithWeight.length === 1) {
      currentWeight = photosWithWeight[0].weight;
      startWeight = currentWeight;
      weightChange = 0;
    }

    return {
      success: true,
      data: {
        totalPhotos: photos.length,
        startWeight,
        currentWeight,
        weightChange,
        photos
      }
    };
  } catch (error) {
    console.error('Error getting progress summary:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};

/**
 * Get photos for a specific date range
 */
export const getPhotosInRange = async (userId, startDate, endDate) => {
  const configError = checkFirebaseConfig();
  if (configError) return configError;

  try {
    const q = query(
      collection(db, 'progressPhotos'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const photos = [];

    querySnapshot.forEach((doc) => {
      photos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      data: photos
    };
  } catch (error) {
    console.error('Error getting photos in range:', error);
    const errorCode = mapFirestoreErrorCode(error);
    return createErrorResponse(errorCode);
  }
};
