import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// IMPORTANT: Set these environment variables in your .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate required config
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

// Track configuration status for error handling
export const isFirebaseConfigured = missingKeys.length === 0;
export const firebaseConfigError = missingKeys.length > 0
  ? {
      code: 'auth/configuration-not-found',
      message: `Missing required Firebase config: ${missingKeys.join(', ')}. Please create a .env file based on .env.example with your Firebase credentials.`,
      missingKeys
    }
  : null;

// Track if all Firebase services initialized successfully
export let isFirebaseFullyInitialized = false;

if (missingKeys.length > 0) {
  console.error(`[Firebase Config Error] Missing required keys: ${missingKeys.join(', ')}`);
  console.error('Please create a .env file based on .env.example with your Firebase credentials.');
  console.error('Also ensure Email/Password authentication is enabled in Firebase Console.');
}

// Initialize Firebase only if properly configured
let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    // Only set to true if all services initialized
    if (app && auth && db && storage) {
      isFirebaseFullyInitialized = true;
    }
  } catch (error) {
    console.error('[Firebase Init Error]', error);
  }
}

export { auth, db, storage };
export default app;
