import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store/store';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import MealAnalyzer from './pages/MealAnalyzer';
import MealPlanner from './pages/MealPlanner';
import Goals from './pages/Goals';
import Favourites from './pages/Favourites';
import Achievements from './pages/Achievements';
import History from './pages/History';
import Account from './pages/Account';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }
  
  return children;
};

function App() {
  // Check for dark mode preference
  React.useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Provider store={store}>
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
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="analyze" element={<MealAnalyzer />} />
              <Route path="meal-planner" element={<MealPlanner />} />
              <Route path="goals" element={<Goals />} />
              <Route path="favourites" element={<Favourites />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="history" element={<History />} />
              <Route path="account" element={<Account />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
