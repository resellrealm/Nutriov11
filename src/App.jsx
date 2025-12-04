import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import { setCredentials, setOnboardingComplete } from './store/authSlice';
import { LOADING_TIMEOUT, TOAST_DURATION, TOAST_SUCCESS_COLOR, TOAST_ERROR_COLOR } from './config/constants';
import { logError } from './utils/errorLogger';

// Layout
import Layout from './components/Layout/Layout';

// Loading
import LoadingScreen from './components/LoadingScreen';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';


// Lazy loading wrapper with error recovery
const lazyWithRetry = (componentImport) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      // Try to load the component
      const attemptLoad = (retries = 3) => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            if (retries > 0) {
              // Wait a bit before retrying
              setTimeout(() => {
                attemptLoad(retries - 1);
              }, 1000);
            } else {
              // If all retries failed, reject with a friendly error
              reject(error);
            }
          });
      };
      attemptLoad();
    });
  });
};

// Lazy-loaded pages for code splitting with retry logic
const OnboardingFlowV2 = lazyWithRetry(() => import('./components/OnboardingV2/OnboardingFlowV2'));
const Onboarding = lazyWithRetry(() => import('./pages/Onboarding'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const MealAnalyzer = lazyWithRetry(() => import('./pages/MealAnalyzer'));
const MealPlanner = lazyWithRetry(() => import('./pages/MealPlanner'));
const Goals = lazyWithRetry(() => import('./pages/Goals'));
const Favourites = lazyWithRetry(() => import('./pages/Favourites'));
const Achievements = lazyWithRetry(() => import('./pages/Achievements'));
const Analytics = lazyWithRetry(() => import('./pages/Analytics'));
const History = lazyWithRetry(() => import('./pages/History'));
const Account = lazyWithRetry(() => import('./pages/Account'));
const GroceryList = lazyWithRetry(() => import('./pages/GroceryList'));
const BarcodeScanner = lazyWithRetry(() => import('./pages/BarcodeScanner'));
const Paywall = lazyWithRetry(() => import('./pages/Paywall'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Register = lazyWithRetry(() => import('./pages/Register'));

// New pages
const Water = lazyWithRetry(() => import('./pages/Water'));
const Exercise = lazyWithRetry(() => import('./pages/Exercise'));
const ProgressPhotos = lazyWithRetry(() => import('./pages/ProgressPhotos'));
const Settings = lazyWithRetry(() => import('./pages/Settings'));
const MealCalendar = lazyWithRetry(() => import('./pages/MealCalendar'));
const Reports = lazyWithRetry(() => import('./pages/Reports'));
const RecipeDetails = lazyWithRetry(() => import('./pages/RecipeDetails'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">Loading page...</p>
    </div>
  </div>
);

// Protected Route Component - uses Redux state for consistency
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const hasCompletedOnboarding = useSelector(state => state.auth.hasCompletedOnboarding);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return children;
};

// Auth Required Route - only checks authentication, not onboarding
const AuthRequiredRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// All features are now accessible to authenticated users with completed onboarding
// No separate premium route needed

// Inner app component that can use hooks
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    // Wrap everything in a try-catch for maximum safety
    try {
      // Dark mode
      const darkMode = localStorage.getItem('darkMode') === 'true';
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Rehydrate auth state from localStorage
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          // Validate user object has required fields
          if (user && typeof user === 'object' && user.id) {
            dispatch(setCredentials({ user, token }));
          } else {
            // Invalid user object, clear it
            logError('app.rehydrate', 'Invalid user object in localStorage', { user });
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } catch (error) {
          // Invalid user data in localStorage, clear and log
          logError('app.rehydrate', 'Failed to parse user data from localStorage', { error: error.message });
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }

      if (onboardingComplete) {
        dispatch(setOnboardingComplete(true));
      }
    } catch (error) {
      // Catch any unexpected errors during initialization
      logError('app.init', 'Unexpected error during app initialization', { error: error.message });
    }

    // Safety timeout so we NEVER get stuck on loader
    // LoadingScreen takes 5 seconds (10% every 500ms) + 300ms delay = ~5.3s
    const timeout = setTimeout(() => setIsLoading(false), LOADING_TIMEOUT);
    return () => clearTimeout(timeout);
  }, [dispatch]);

  return (
    <ErrorBoundary>
      {isLoading ? (
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      ) : (
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: TOAST_DURATION,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: TOAST_SUCCESS_COLOR,
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: TOAST_ERROR_COLOR,
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/onboarding"
                  element={
                    <AuthRequiredRoute>
                      <Onboarding />
                    </AuthRequiredRoute>
                  }
                />

                {/* Barcode Scanner - Full Screen (Outside Layout) */}
                <Route
                  path="/barcode"
                  element={
                    <ProtectedRoute>
                      <BarcodeScanner />
                    </ProtectedRoute>
                  }
                />

                {/* Paywall - Full Screen (Outside Layout) */}
                <Route
                  path="/paywall"
                  element={
                    <AuthRequiredRoute>
                      <Paywall />
                    </AuthRequiredRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="analyze" element={<MealAnalyzer />} />
                  <Route path="meal-planner" element={<MealPlanner />} />
                  <Route path="grocery-list" element={<GroceryList />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="favourites" element={<Favourites />} />
                  <Route path="achievements" element={<Achievements />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="history" element={<History />} />
                  <Route path="account" element={<Account />} />
                  <Route path="water" element={<Water />} />
                  <Route path="exercise" element={<Exercise />} />
                  <Route path="progress" element={<ProgressPhotos />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="calendar" element={<MealCalendar />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="recipe/:recipeId" element={<RecipeDetails />} />
                </Route>

                {/* 404 Catch-all Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      )}
    </ErrorBoundary>
  );
}

// Main App wrapper with Provider
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
