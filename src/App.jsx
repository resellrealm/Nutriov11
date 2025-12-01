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

// Lazy-loaded pages for code splitting
const OnboardingFlowV2 = lazy(() => import('./components/OnboardingV2/OnboardingFlowV2'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MealAnalyzer = lazy(() => import('./pages/MealAnalyzer'));
const MealPlanner = lazy(() => import('./pages/MealPlanner'));
const Goals = lazy(() => import('./pages/Goals'));
const Favourites = lazy(() => import('./pages/Favourites'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Analytics = lazy(() => import('./pages/Analytics'));
const History = lazy(() => import('./pages/History'));
const Account = lazy(() => import('./pages/Account'));
const GroceryList = lazy(() => import('./pages/GroceryList'));
const BarcodeScanner = lazy(() => import('./pages/BarcodeScanner'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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

// Premium Route - requires both authentication and premium status
const PremiumRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const hasCompletedOnboarding = useSelector(state => state.auth.hasCompletedOnboarding);
  const isPremium = useSelector(state => state.auth.isPremium);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  // If not premium, redirect to dashboard with upgrade prompt
  if (!isPremium) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Inner app component that can use hooks
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
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
        dispatch(setCredentials({ user, token }));
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
                  <Route path="meal-planner" element={<PremiumRoute><MealPlanner /></PremiumRoute>} />
                  <Route path="grocery-list" element={<PremiumRoute><GroceryList /></PremiumRoute>} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="favourites" element={<Favourites />} />
                  <Route path="achievements" element={<Achievements />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="history" element={<History />} />
                  <Route path="account" element={<Account />} />
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
