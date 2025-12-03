#!/usr/bin/env node

/**
 * Weekly AI Meal Generation Script
 * Runs every Sunday at 12pm via GitHub Actions
 * Generates 7 personalized meals for all 72 user categories
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { generateAllCategoryMeals } from '../src/services/aiMealGenerationService.js';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Validate environment variables
const requiredEnvVars = [
  'VITE_GEMINI_API_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n💡 Add these as GitHub Secrets in your repository settings.');
  process.exit(1);
}

// Initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  process.exit(1);
}

// Progress tracking
let lastProgress = null;

function logProgress(progress) {
  const { category, completedCategories, totalCategories } = progress;
  const percentage = Math.round((completedCategories / totalCategories) * 100);

  // Only log when category changes (avoid spamming)
  if (category !== lastProgress?.category) {
    console.log(`\n📊 Progress: ${completedCategories}/${totalCategories} (${percentage}%)`);
    console.log(`   Current: ${category}`);
    lastProgress = progress;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting weekly AI meal generation...');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log('');

  const startTime = Date.now();

  try {
    const results = await generateAllCategoryMeals(logProgress);

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 WEEKLY MEAL GENERATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${duration} minutes`);
    console.log(`✅ Success: ${results.success.length} categories`);
    console.log(`❌ Failed: ${results.failed.length} categories`);
    console.log('');

    if (results.failed.length > 0) {
      console.log('⚠️  Failed categories:');
      results.failed.forEach(({ categoryId, error }) => {
        console.log(`   - ${categoryId}: ${error}`);
      });
      console.log('');
    }

    console.log('📊 Statistics:');
    console.log(`   - Total meals generated: ${results.success.length * 7}`);
    console.log(`   - Categories processed: ${results.success.length + results.failed.length}`);
    console.log(`   - Success rate: ${Math.round((results.success.length / (results.success.length + results.failed.length)) * 100)}%`);
    console.log('');

    // Exit with error code if some categories failed
    if (results.failed.length > 0) {
      console.warn('⚠️  Some categories failed. Check logs above.');
      process.exit(1);
    }

    console.log('✅ All categories generated successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
