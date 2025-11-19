import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import { setCredentials, setOnboardingComplete } from './store/authSlice';

// Layout
import Layout from './components/Layout/Layout';

// Loading
import LoadingScreen from './components/LoadingScreen';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import OnboardingFlowV2 from './components/OnboardingV2/OnboardingFlowV2';
import Dashboard from './pages/Dashboard';
import MealAnalyzer from './pages/MealAnalyzer';
import MealPlanner from './pages/MealPlanner';
import Goals from './pages/Goals';
import Favourites from './pages/Favourites';
import Achievements from './pages/Achievements';
import History from './pages/History';
import Account from './pages/Account';
import GroceryList from './pages/GroceryList';
import BarcodeScanner from './pages/BarcodeScanner';
import Login from './pages/Login';
import Register from './pages/Register';

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
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }

    if (onboardingComplete) {
      dispatch(setOnboardingComplete(true));
    }

    // Safety timeout so we NEVER get stuck on loader
    const timeout = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [dispatch]);

  return (
    <ErrorBoundary>
      {isLoading ? (
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      ) : (
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#7fc7a1',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<OnboardingFlowV2 />} />

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
                <Route path="meal-planner" element={<MealPlanner />} />
                <Route path="grocery-list" element={<GroceryList />} />
                <Route path="goals" element={<Goals />} />
                <Route path="favourites" element={<Favourites />} />
                <Route path="achievements" element={<Achievements />} />
                <Route path="history" element={<History />} />
                <Route path="account" element={<Account />} />
              </Route>
            </Routes>
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
