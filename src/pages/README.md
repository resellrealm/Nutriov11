# Pages Directory

## 📁 Copy Your Existing Page Files Here

From your current project (`nutrio-complete/frontend/src/pages/`), copy these files:

- ✅ Login.jsx
- ✅ Register.jsx
- ✅ Onboarding.jsx
- ✅ Dashboard.jsx
- ✅ MealAnalyzer.jsx
- ✅ MealPlanner.jsx
- ✅ Goals.jsx
- ✅ Favourites.jsx
- ✅ Achievements.jsx
- ✅ History.jsx

## 🆕 New Page You Need

I'll create a new **Account.jsx** page for you with:
- Profile management
- Dark mode toggle
- Subscription info
- Settings

## 🎨 Color Updates Needed

In all your page files, do a find & replace:
- `#10b981` → `#7fc7a1` (old primary → new primary)
- `#84cc16` → `#6bb591` (old accent → new accent)

## 🛠️ Key Updates to Make:

### Dashboard.jsx:
- Remove any "Welcome back" text from the JSX (it's now in Layout header as quote card)
- Update colors to teal

### MealAnalyzer.jsx:
- Import API functions: `import { analyzeFoodImage, canUserScan, incrementScanCount } from '../utils/api';`
- Add scan limit check before analysis
- Show upgrade prompt if limit reached

That's it! Once you copy these files, the app will be complete! 🚀
