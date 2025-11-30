# Nutrio

A comprehensive nutrition tracking and meal planning application built with React, Firebase, and modern web technologies.

## Features

### User Onboarding & Personalization
- **20-Step Comprehensive Onboarding**: Complete personalization flow covering:
  - Welcome and basic info (name, age, height, weight)
  - Primary health goals (weight loss, muscle gain, maintenance, etc.)
  - Timeline and activity level assessment
  - Exercise preferences and dietary restrictions
  - Allergies and cuisine preferences
  - Favorite and disliked foods
  - Household size and budget planning
  - Shopping preferences and meal timing
  - Cooking skill level and medical conditions
  - Supplement usage and notification preferences
- **Calculated Metrics**: BMI, BMR, TDEE based on your profile
- **Goal-Specific Recommendations**: Personalized calorie and macro targets

### Dashboard
- **Daily Recommended Meal**: Unique meal suggestion that changes daily (62 recipes in rotation)
- **Motivational Quotes**: Goal-specific daily quotes
- **Quick Stats**: Calories, protein, streak, weight at a glance
- **Weekly Charts**: Calorie intake bar charts, macronutrient distribution pie charts
- **Meal Type Distribution**: Visual breakdown of breakfast/lunch/dinner/snacks
- **Progress Tracking**: Average daily calories, meals logged, daily goals

### Recipe System
- **62 Built-in Recipes**: Professionally crafted meals covering breakfast, lunch, dinner, and snacks
- **Daily Meal Rotation**: Different recommended meal each day for 2+ months
- **Nutritional Info**: Calories, protein, carbs, fat, fiber for every recipe
- **Detailed Instructions**: Step-by-step cooking instructions
- **Ingredient Lists**: Complete ingredient lists for grocery planning
- **Tags & Filters**: High Protein, Vegan, Low Carb, Quick, Family Friendly, etc.
- **User Custom Recipes**: Save your own recipes to Firestore
- **Recipe Search**: Search by name, description, or ingredients

### Food Logging
- **Multiple Input Methods**:
  - Barcode scanning (with Open Food Facts API v2 integration)
  - Photo analysis (AI-powered via Google Gemini)
  - Manual entry
- **AI-Powered Meal Analysis**:
  - Google Gemini AI for meal photo recognition and nutrition estimation
  - Confidence scoring and portion size detection
  - Ingredient identification with calorie breakdown
  - Smart meal type detection (breakfast, lunch, dinner, snack)
  - Health scoring and personalized suggestions
- **Meal Type Categorization**: Breakfast, lunch, dinner, snacks
- **Nutritional Tracking**: Calories, protein, carbs, fat, fiber, sugar, sodium
- **Daily & Weekly Summaries**: Aggregated nutrition data
- **History View**: Complete food log history with filtering

### Meal Planning
- **Fridge Scanning**: Upload photos to detect available ingredients
- **Smart Suggestions**: Get meal ideas based on what you have
- **Match Scores**: See which recipes match your available ingredients
- **Difficulty Levels**: Easy, Medium, Hard cooking options
- **Meal Type Selection**: Filter by breakfast, lunch, dinner, snack

### AI Image Services (ModelsLab)
- **Food Image Analysis**: Detect food items from images with portion estimates
- **Recipe Image Generation**: AI-generated professional food photography for recipes
- **Background Removal**: Clean product shots with automatic background removal
- **Image Upscaling**: Enhance image quality with 2x-4x upscaling
- **Batch Processing**: Generate images for multiple recipes at once

### Additional Features
- **Grocery List Generation**: Auto-generate shopping lists based on meal plans
- **Achievements System**: Unlock achievements for consistent tracking
- **Favorites Management**: Save and organize favorite recipes
- **Goals Tracking**: Detailed progress toward health goals with visual charts
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Account Management**: Update profile, preferences, and settings

### Data & Privacy
- **Firebase Authentication**: Secure user accounts with email/password
- **Firestore Database**: Real-time data sync
- **User Data Ownership**: Full control over your nutrition data

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Backend**: Firebase (Auth, Firestore)
- **AI Services**:
  - Google Gemini AI (meal photo analysis)
  - ModelsLab AI (image generation & processing)
- **APIs**: Open Food Facts v2 (barcode scanning)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Mobile**: Capacitor (iOS support)
- **Icons**: Lucide React

## Installation

```bash
# Clone the repository
git clone https://github.com/resellrealm/Nutrio.git

# Navigate to project
cd Nutrio

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Setup

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

For AI-powered meal analysis, add:
```env
# Google Gemini AI (FREE - get key from https://makersuite.google.com/app/apikey)
VITE_GEMINI_API_KEY=your_gemini_api_key

# ModelsLab AI (Optional - for image generation & processing)
VITE_MODELSLAB_API_KEY=your_modelslab_api_key
```

## Build

```bash
# Production build
npm run build

# Preview production build
npm run preview

# iOS build
npm run ios
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Layout/       # App layout, sidebar, header
│   ├── OnboardingV2/ # 20-step onboarding flow
│   └── ...
├── config/           # Firebase configuration
├── pages/            # Main application pages
│   ├── Dashboard.jsx
│   ├── MealAnalyzer.jsx
│   ├── MealPlanner.jsx
│   ├── GroceryList.jsx
│   ├── Goals.jsx
│   ├── Favourites.jsx
│   ├── Achievements.jsx
│   ├── History.jsx
│   ├── Account.jsx
│   ├── BarcodeScanner.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── services/         # Firestore services & API integrations
│   ├── userService.js
│   ├── foodLogService.js
│   ├── recipeService.js
│   ├── groceryListService.js
│   ├── authService.js
│   ├── geminiService.js
│   ├── modelsLabService.js
│   └── openFoodFactsService.js
├── store/            # Redux store and slices
│   ├── store.js
│   ├── authSlice.js
│   ├── onboardingSlice.js
│   ├── nutritionSlice.js
│   └── achievementsSlice.js
├── utils/            # Utility functions
└── App.jsx           # Main application component
```

## Key Services

- **userService.js**: User profile management, onboarding data, calculated metrics (BMI, BMR, TDEE)
- **foodLogService.js**: Food logging, daily/weekly nutrition summaries
- **recipeService.js**: 62 built-in recipes, user custom recipes, meal of the day
- **groceryListService.js**: Smart grocery list generation from recipes
- **authService.js**: Firebase authentication wrapper
- **geminiService.js**: Google Gemini AI for meal photo analysis and nutrition estimation
- **modelsLabService.js**: ModelsLab AI for image analysis, generation, and processing
- **openFoodFactsService.js**: Open Food Facts API v2 for barcode product lookup

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run ios` - Build and open iOS app

## Version

11.0.0 - Complete nutrition tracking app with:
- 62 built-in recipes for daily meal recommendations
- 20-step comprehensive onboarding flow
- **Google Gemini AI integration** for intelligent meal photo analysis
- **ModelsLab AI integration** for image generation and processing
- **Open Food Facts API v2** for enhanced barcode scanning
- User custom recipe storage in Firestore
- Dashboard with charts and progress tracking
- Food logging via barcode, AI photo analysis, or manual entry
- Grocery list generation
- Achievements and goals tracking

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
