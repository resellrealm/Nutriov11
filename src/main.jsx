import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import './index.css'

// Initialize Sentry for error monitoring (production only)
if (import.meta.env.VITE_SENTRY_DSN && !import.meta.env.DEV) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
    // Environment
    environment: import.meta.env.MODE || 'production',
    // Release tracking
    release: `nutrio@${import.meta.env.VITE_APP_VERSION || '11.0.0'}`,
  });
}

// Get root element and verify it exists
const rootElement = document.getElementById('root');

if (!rootElement) {
  // Root element not found - critical error
  console.error('CRITICAL: Root element not found. Cannot initialize React app.');
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: system-ui, -apple-system, sans-serif;">
      <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 400px; margin: 1rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h1 style="font-size: 1.5rem; color: #1f2937; margin-bottom: 0.5rem;">Unable to Start App</h1>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">The application failed to initialize. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
} else {
  // Root element found - initialize React app
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('CRITICAL: Failed to initialize React:', error);
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: system-ui, -apple-system, sans-serif;">
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 400px; margin: 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
          <h1 style="font-size: 1.5rem; color: #1f2937; margin-bottom: 0.5rem;">Initialization Error</h1>
          <p style="color: #6b7280; margin-bottom: 1.5rem;">Failed to start the application. Please refresh and try again.</p>
          <button onclick="window.location.reload()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}
