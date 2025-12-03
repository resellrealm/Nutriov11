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
- **Personalized Daily Meal Recommendation**: Smart meal suggestions based on YOUR preferences
  - 🔒 **Safety First**: Automatically filters out allergens (nuts, dairy, shellfish, etc.)
  - 🥗 **Dietary Restrictions**: Respects vegetarian, vegan, gluten-free, low-carb preferences
  - 🚫 **Avoids Dislikes**: Excludes foods you don't like
  - 👥 **Category-Based**: Users with same preferences get same meal on same day
  - 🔄 **Daily Rotation**: Different meal each day within your compatible recipes
- **Motivational Quotes**: Goal-specific daily quotes
- **Quick Stats**: Calories, protein, streak, weight at a glance
- **Weekly Charts**: Calorie intake bar charts, macronutrient distribution pie charts
- **Meal Type Distribution**: Visual breakdown of breakfast/lunch/dinner/snacks
- **Progress Tracking**: Average daily calories, meals logged, daily goals

### Recipe System
- **AI-Powered Personalized Meals** (Premium):
  - **72 User Categories**: Based on 6 goals × 12 dietary types
  - **7 AI-Generated Meals Per Week**: One personalized meal per day
  - **Automatic Weekly Generation**: Fresh meals every Sunday at 12pm UTC
  - **Smart Filtering**: Automatically excludes your allergens
  - **Goal-Optimized**: Nutrition tailored to your specific health goals
  - **Total: 504 AI Meals** generated weekly across all categories
- **28 Static Backup Recipes**: Professionally crafted fallback meals (Free)
  - 7 breakfast, 7 lunch, 7 dinner, 7 snacks
  - Available to all users when AI meals unavailable
- **Daily Meal Recommendations**: Different recommended meal each day
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
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI Services**:
  - Google Gemini AI (meal photo analysis)
  - ModelsLab AI (image generation & processing)
- **APIs**: Open Food Facts v2 (barcode scanning)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Mobile**: Capacitor (iOS support)
- **Icons**: Lucide React

## Quick Start

**Minimum requirements to run Nutrio:**

1. **Firebase Project** (free) - for auth & database
2. **Google Gemini API Key** (free) - for AI meal analysis
3. **Node.js 18+** installed

**Setup time:** ~10 minutes

👉 See detailed setup instructions below.

## Installation

```bash
# Clone the repository
git clone https://github.com/resellrealm/Nutrio.git

# Navigate to project
cd Nutrio

# Install dependencies
npm install
```

## Environment Setup

### Step 1: Create Environment File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Step 2: Configure Required API Keys

Edit `.env` and add your API keys:

#### **Firebase Configuration (REQUIRED)**

Get your Firebase credentials from the [Firebase Console](https://console.firebase.google.com/):

1. Create a new project or select existing one
2. Go to **Project Settings** > **General**
3. Scroll to **Your apps** section
4. Click the **Web app** (`</>`) icon to create a web app
5. Copy the config values to your `.env` file:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

#### **Google Gemini AI (REQUIRED)**

Nutrio uses Gemini AI for meal photo analysis and smart meal suggestions. Get a **FREE** API key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key to your `.env` file:

```env
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXX
```

**Free Tier Limits:**
- 60 requests/minute
- 1,500 requests/day
- 1 million tokens/month

#### **ModelsLab AI (OPTIONAL)**

Only needed if you want AI-generated recipe images:

```env
# VITE_MODELSLAB_API_KEY=your_modelslab_api_key
```

Get key from [ModelsLab](https://modelslab.com/) (paid service).

### Step 3: Firebase Backend Setup

#### Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

#### Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll add rules next)
4. Select your preferred location
5. Click **Enable**

#### Set Up Firestore Security Rules

1. In Firestore Database, go to the **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);

      // User subcollections (settings, notifications)
      match /{document=**} {
        allow read, write: if isOwner(userId);
      }
    }

    // Food logs
    match /foodLogs/{userId}/logs/{logId} {
      allow read, write: if isOwner(userId);
    }

    // Custom recipes
    match /recipes/{recipeId} {
      allow read: if true; // Anyone can read recipes
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() &&
        resource.data.createdBy == request.auth.uid;
    }

    // Grocery lists
    match /groceryLists/{userId}/lists/{listId} {
      allow read, write: if isOwner(userId);
    }

    // Achievements
    match /achievements/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

3. Click **Publish**

#### Enable Firebase Storage (for Profile Photos)

1. In Firebase Console, go to **Storage**
2. Click **Get Started**
3. Choose **Start in production mode**
4. Click **Done**
5. Go to **Rules** tab and set:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // Max 5MB
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

6. Click **Publish**

### Step 4: Configure GitHub Secrets (For AI Meal Generation)

To enable automatic weekly AI meal generation, add these secrets to your GitHub repository:

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add each of these:

```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**What This Does:**
- GitHub Actions will run every Sunday at 12:00 PM UTC
- Generates 7 personalized meals for all 72 user categories
- Stores meals in Firestore for the week
- Meals automatically appear in premium users' dashboards

**Manual Trigger:**
- Go to **Actions** tab → **Generate Weekly AI Meals** → **Run workflow**

### Step 5: Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Optional: Mobile Setup (iOS/Android)

To enable camera features for barcode scanning and meal photo capture on mobile:

### Install Capacitor Plugins

```bash
# Install camera plugins
npm install @capacitor/camera @capacitor-community/barcode-scanner

# Sync with native projects
npx cap sync
```

### Configure iOS

Add to `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan barcodes and analyze meals</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to analyze meal photos</string>
```

### Configure Android

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

See [CAMERA_SETUP.md](./CAMERA_SETUP.md) for complete mobile setup instructions.

## Build

```bash
# Production build
npm run build

# Preview production build
npm run preview

# iOS build (requires Xcode)
npm run ios
```

## Verify Setup

After setup, test these features to ensure everything works:

### 1. Authentication ✓
- [ ] Register new account
- [ ] Login with email/password
- [ ] Logout

### 2. Onboarding ✓
- [ ] Complete 20-step onboarding flow
- [ ] Data saves to Firestore

### 3. Dashboard ✓
- [ ] Daily meal recommendation shows
- [ ] Charts render correctly

### 4. Meal Analysis (Gemini AI) ✓
- [ ] Upload meal photo
- [ ] AI detects food and nutrition
- [ ] Saves to food log

### 5. Barcode Scanning ✓
- [ ] Scan or enter barcode manually
- [ ] Fetches product from Open Food Facts
- [ ] Adds to food log

### 6. Recipes ✓
- [ ] Browse AI-generated personalized meals (Premium)
- [ ] Browse 28 static recipes (Free)
- [ ] Create custom recipe (saves to Firestore)
- [ ] Search recipes

### 7. Profile Photos (Firebase Storage) ✓
- [ ] Upload profile photo
- [ ] Photo displays in Account page

### 8. Browser Notifications (Optional) ✓
- [ ] Enable notifications in browser
- [ ] Set up meal reminders
- [ ] Receive achievement alerts

Browser notifications work automatically - no additional setup required. Users can configure:
- Meal reminders (breakfast, lunch, dinner, snack)
- Water intake reminders
- Daily logging reminders
- Achievement and goal alerts

## API Key Summary

| Service | Required? | Cost | Purpose |
|---------|-----------|------|---------|
| **Firebase** | ✅ Required | FREE* | Authentication, Firestore DB, Storage |
| **Google Gemini AI** | ✅ Required | FREE | Meal photo analysis, smart suggestions |
| **Open Food Facts** | ✅ Built-in | FREE | Barcode product lookup (no key needed) |
| **ModelsLab** | ⚪ Optional | Paid | AI-generated recipe images |

*Firebase free tier includes: 50K reads/day, 20K writes/day, 1GB storage

## Troubleshooting

### "Firebase not configured" error
- Ensure `.env` file exists in project root
- Check all `VITE_FIREBASE_*` variables are set
- Restart dev server: `npm run dev`

### "Gemini API error"
- Verify `VITE_GEMINI_API_KEY` is set correctly
- Check you haven't exceeded free tier limits (1,500/day)
- Get new key at https://makersuite.google.com/app/apikey

### Firestore permission denied
- Ensure Firestore security rules are published
- Check user is logged in
- Verify rules match user ID correctly

### Profile photo upload fails
- Enable Firebase Storage in console
- Publish storage security rules
- Check image is under 5MB
- Verify file is an image format

### Barcode scanner not working
- **Web:** Manual entry works; camera requires mobile app
- **Mobile:** Install Capacitor plugins (see CAMERA_SETUP.md)
- **Mobile:** Test on real device, not simulator

## What Works Without API Keys?

Even without API keys configured, you can still:

- ✅ View the UI and navigation
- ✅ See the 62 built-in recipes
- ✅ Test onboarding flow (data won't persist)
- ✅ Explore dashboard layout

**To actually use the app, you need:**
- Firebase (for login, data storage)
- Gemini AI (for meal photo analysis)

## Feature Dependencies

| Feature | Requires Firebase | Requires Gemini | Requires ModelsLab |
|---------|-------------------|-----------------|-------------------|
| Login/Register | ✅ | ❌ | ❌ |
| Onboarding | ✅ | ❌ | ❌ |
| Dashboard | ✅ | ❌ | ❌ |
| Food Logging (Manual) | ✅ | ❌ | ❌ |
| Meal Photo Analysis | ✅ | ✅ | ❌ |
| Barcode Scanning | ✅ | ❌ | ❌ |
| Fridge Scanning | ✅ | ✅ | ❌ |
| Recipe Browsing | ❌ | ❌ | ❌ |
| Custom Recipes | ✅ | ❌ | ❌ |
| Profile Photos | ✅ (Storage) | ❌ | ❌ |
| Recipe Image Generation | ❌ | ❌ | ✅ |
| Browser Notifications | ✅ | ❌ | ❌ |

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

## Code Quality & Architecture

Nutrio is built with production-ready code quality standards:

### Development Best Practices
- ✅ **Clean Code**: No unused imports, commented code, or debug statements
- ✅ **Error Handling**: Centralized error logging with development/production modes
- ✅ **Modern React**: Hooks-based architecture with proper async/await patterns
- ✅ **Performance**: Code splitting, lazy loading, and strategic use of useCallback/useMemo
- ✅ **State Management**: Redux Toolkit with normalized state structure
- ✅ **Type Safety Ready**: Code structure supports future TypeScript migration
- ✅ **Consistent Style**: ESLint enforced, camelCase/PascalCase naming conventions

### Error Logging System
All errors are logged through a centralized `errorLogger` utility:
- Development: Console output for debugging
- Production: Ready for integration with Sentry, LogRocket, or Rollbar
- Local storage backup for debugging (last 10 errors)

### Build Optimization
- **Vite** for fast builds and HMR
- **Code Splitting**: Manual chunks (react, redux, firebase, ui vendors)
- **Tree Shaking**: Unused code automatically removed
- **Production Build**: Console statements stripped via esbuild config

## AI Meal Generation System

Nutrio uses an intelligent AI-powered meal generation system that creates personalized weekly meal plans:

### How It Works

**1. User Categories (72 Total)**
- **6 Health Goals**: Weight loss, muscle gain, maintenance, improved health, condition management, athletic performance
- **12 Dietary Types**: Omnivore, vegetarian, vegan, pescatarian, paleo, keto, low-carb, gluten-free, dairy-free, halal, kosher, none
- **Category Matching**: Users are assigned to one of 72 categories based on their onboarding responses

**2. Weekly Generation**
- **Automatic Scheduling**: GitHub Actions runs every Sunday at 12:00 PM UTC
- **AI Generation**: Google Gemini AI creates 7 unique meals per category
- **Random Meal Types**: Each day gets a random meal type (breakfast, lunch, or dinner)
- **Cost Efficiency**: 504 total AI calls per week (72 categories × 7 meals)

**3. Personalization**
- **Goal-Optimized Nutrition**: Meals tailored to your specific health goals
- **Dietary Compliance**: Strict adherence to dietary restrictions
- **Allergy Filtering**: Automatically excludes allergens from recommendations
- **Daily Rotation**: Different meal each day of the week

**4. Fallback System**
- **28 Static Recipes**: Hand-crafted backup recipes (7 per meal type)
- **Graceful Degradation**: Falls back to static recipes if AI meals unavailable
- **Universal Access**: Static recipes available to all users

## Premium vs Free Features

### 🌟 Premium Features
- **AI Personalized Meals**: 7 AI-generated meals per week based on your goals & diet
- **Meal Planner Access**: Full access to weekly meal planning
- **Grocery List Generation**: Auto-generate shopping lists from meal plans
- **20 Daily AI Scans**: Analyze meal photos with AI (vs 2 for free)
- **Advanced Analytics**: Comprehensive nutrition insights and trends
- **No Ads**: Ad-free experience

### 🆓 Free Features
- **28 Static Recipes**: Browse curated breakfast, lunch, dinner, and snacks
- **Food Logging**: Manual entry and barcode scanning
- **2 Daily AI Scans**: Limited meal photo analysis
- **Dashboard**: Basic nutrition tracking and charts
- **Goals Tracking**: Set and monitor your health goals
- **Achievements**: Unlock achievements for consistency
- **Custom Recipes**: Create and save your own recipes

## Version

**11.0.0** - Complete nutrition tracking app with AI-powered personalized meals

### Core Features
- AI-powered personalized meal generation (7 meals per week, 72 categories)
- 20-step comprehensive onboarding flow
- AI-powered meal photo analysis (Google Gemini)
- Barcode scanning (Open Food Facts API v2)
- Dashboard with charts and progress tracking
- Food logging (barcode, AI photo, or manual)
- Custom recipe creation and management
- Grocery list generation
- Achievements and goals tracking
- Browser notifications for reminders

### Code Statistics
- **Total Lines of Code**: ~15,800 lines
- **Components**: 14 pages, 30+ reusable components
- **Services**: 11 API/business logic services
- **Zero Technical Debt**: No console statements, unused code, or TODOs in production paths

### Required Setup
To use Nutrio, you **must** configure:
1. ✅ **Firebase** (Auth + Firestore + Storage) - [Free tier available](https://firebase.google.com/pricing)
2. ✅ **Google Gemini API** - [Free tier: 1,500 requests/day](https://makersuite.google.com/app/apikey)

### Optional Enhancements
- 📱 **Capacitor plugins** - Enable mobile camera features
- 🎨 **ModelsLab API** - Generate AI recipe images (paid)
- 🔍 **Error Tracking** - Add Sentry/LogRocket for production monitoring

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
