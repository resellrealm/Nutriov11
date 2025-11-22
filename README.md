# Nutrio v11

A comprehensive nutrition tracking and meal planning application built with React, Firebase, and modern web technologies.

## Features

### User Onboarding & Personalization
- **Personalized Setup**: Complete onboarding flow for new users
- **Dietary Style Preferences**: Support for various diets (vegan, vegetarian, keto, paleo, etc.)
- **Goal Setting**: Weight loss, muscle gain, maintenance, or general health improvement
- **Body Metrics**: Track height, weight, BMI, and calculate TDEE
- **Activity Level Assessment**: Sedentary to extremely active options
- **Meal Timing Preferences**: Customize breakfast, lunch, dinner, and snack times
- **Budget Planning**: Set weekly grocery budgets per person
- **Household Settings**: Family size considerations for meal planning

### Dashboard
- **Daily Recommended Meal**: Unique meal suggestion that changes daily (62+ recipes in rotation)
- **Motivational Quotes**: Goal-specific daily quotes
- **Quick Stats**: Calories, protein, streak, weight at a glance
- **Weekly Charts**: Calorie intake bar charts, macronutrient distribution pie charts
- **Meal Type Distribution**: Visual breakdown of breakfast/lunch/dinner/snacks
- **Progress Tracking**: Average daily calories, meals logged, daily goals

### Recipe System
- **62+ Built-in Recipes**: Professionally crafted meals covering breakfast, lunch, dinner, and snacks
- **Daily Meal Rotation**: Different recommended meal each day for 2+ months
- **Nutritional Info**: Calories, protein, carbs, fat, fiber for every recipe
- **Detailed Instructions**: Step-by-step cooking instructions
- **Ingredient Lists**: Complete ingredient lists for grocery planning
- **Tags & Filters**: High Protein, Vegan, Low Carb, Quick, Family Friendly, etc.
- **User Custom Recipes**: Save your own recipes to Firestore
- **Recipe Search**: Search by name, description, or ingredients

### Food Logging
- **Multiple Input Methods**:
  - Barcode scanning
  - Photo analysis (AI-powered)
  - Manual entry
- **Meal Type Categorization**: Breakfast, lunch, dinner, snacks
- **Nutritional Tracking**: Calories, protein, carbs, fat, fiber, sugar, sodium
- **Daily & Weekly Summaries**: Aggregated nutrition data
- **History View**: Complete food log history

### Meal Planning
- **Fridge Scanning**: Upload photos to detect available ingredients
- **Smart Suggestions**: Get meal ideas based on what you have
- **Match Scores**: See which recipes match your available ingredients
- **Difficulty Levels**: Easy, Medium, Hard cooking options
- **Meal Type Selection**: Filter by breakfast, lunch, dinner, snack

### Additional Features
- **Grocery List Generation**: Auto-generate shopping lists based on meal plans
- **Achievements System**: 40+ unique achievements to unlock
- **Favorites Management**: Save and organize favorite recipes
- **Goals Tracking**: Detailed progress toward health goals
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Offline Support**: PWA capabilities for offline use

### Data & Privacy
- **Firebase Authentication**: Secure user accounts
- **Firestore Database**: Real-time data sync
- **User Data Ownership**: Full control over your nutrition data

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Mobile**: Capacitor
- **Icons**: Lucide React

## Installation

```bash
# Clone the repository
git clone https://github.com/resellrealm/Nutriov11.git

# Navigate to project
cd Nutriov11

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

## Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── config/           # Firebase and app configuration
├── pages/            # Main application pages
├── services/         # Firestore services (user, food log, recipes, grocery)
├── store/            # Redux store and slices
├── utils/            # Utility functions and helpers
└── App.jsx           # Main application component
```

## Key Services

- **userService.js**: User profile management, onboarding, calculated metrics
- **foodLogService.js**: Food logging, daily/weekly summaries
- **recipeService.js**: 62+ built-in recipes, user custom recipes, meal of the day
- **groceryListService.js**: Smart grocery list generation

## Future Enhancements

- Spoonacular API integration for expanded recipe database
- AI-powered meal planning with personalized recommendations
- Social features for sharing recipes and progress
- Integration with fitness trackers
- Barcode database expansion

## Version

11.0.0 - Complete nutrition tracking app with:
- 62+ built-in recipes for daily meal recommendations
- User custom recipe storage in Firestore
- Comprehensive dashboard with charts and stats
- Full onboarding flow with personalized calculations
- Food logging via barcode, photo, or manual entry

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
