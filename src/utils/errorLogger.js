/**
 * Error Logging Utility
 * Centralized error handling and logging
 * In production, this can be extended to integrate with services like Sentry, LogRocket, etc.
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Log an error
 * @param {string} context - Context where the error occurred (e.g., 'authService.login')
 * @param {Error|string} error - The error object or message
 * @param {Object} metadata - Additional metadata to log
 */
export const logError = (context, error, metadata = {}) => {
  const errorMessage = error?.message || error;
  const errorStack = error?.stack;

  // In development, log to console for debugging (with safety check)
  if (isDevelopment && typeof console !== 'undefined' && console.error) {
    try {
      console.error(`[${context}]`, errorMessage, metadata);
      if (errorStack) {
        console.error(errorStack);
      }
    } catch {
      // Silently fail if console is unavailable
    }
  }

  // Production error tracking (not yet implemented)
  // When ready for production, integrate with error tracking service:
  //
  // Option 1: Sentry (recommended for most apps)
  //   - Install: npm install @sentry/react
  //   - Setup: https://docs.sentry.io/platforms/javascript/guides/react/
  //   - Usage: Sentry.captureException(error, { tags: { context }, extra: metadata });
  //
  // Option 2: LogRocket (includes session replay)
  //   - Install: npm install logrocket
  //   - Setup: https://docs.logrocket.com/docs/quickstart
  //   - Usage: LogRocket.captureException(error, { tags: { context }, extra: metadata });
  //
  // Option 3: Rollbar
  //   - Install: npm install rollbar
  //   - Setup: https://docs.rollbar.com/docs/javascript
  //   - Usage: Rollbar.error(errorMessage, { context, ...metadata });

  // Store error in a way that can be accessed for debugging if needed
  try {
    const errorLog = {
      context,
      message: errorMessage,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Could store recent errors in localStorage for debugging
    const recentErrors = JSON.parse(localStorage.getItem('recentErrors') || '[]');
    recentErrors.unshift(errorLog);
    localStorage.setItem('recentErrors', JSON.stringify(recentErrors.slice(0, 10)));
  } catch {
    // If localStorage fails, silently ignore to prevent infinite loops
  }
};

/**
 * Log a warning
 * @param {string} context - Context where the warning occurred
 * @param {string} message - Warning message
 * @param {Object} metadata - Additional metadata
 */
export const logWarning = (context, message, metadata = {}) => {
  if (isDevelopment && typeof console !== 'undefined' && console.warn) {
    try {
      console.warn(`[${context}]`, message, metadata);
    } catch {
      // Silently fail if console is unavailable
    }
  }
};

/**
 * Log info (only in development)
 * @param {string} context - Context
 * @param {string} message - Info message
 * @param {Object} metadata - Additional metadata
 */
export const logInfo = (context, message, metadata = {}) => {
  if (isDevelopment && typeof console !== 'undefined' && console.info) {
    try {
      console.info(`[${context}]`, message, metadata);
    } catch {
      // Silently fail if console is unavailable
    }
  }
};
