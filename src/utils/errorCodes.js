/**
 * Standardized Error Codes System
 * Provides consistent error handling across the application
 */

// Error code constants
export const ERROR_CODES = {
  // Authentication errors (Firebase Auth)
  AUTH_EMAIL_IN_USE: 'auth/email-already-in-use',
  AUTH_INVALID_EMAIL: 'auth/invalid-email',
  AUTH_OPERATION_NOT_ALLOWED: 'auth/operation-not-allowed',
  AUTH_WEAK_PASSWORD: 'auth/weak-password',
  AUTH_USER_DISABLED: 'auth/user-disabled',
  AUTH_USER_NOT_FOUND: 'auth/user-not-found',
  AUTH_WRONG_PASSWORD: 'auth/wrong-password',
  AUTH_INVALID_CREDENTIAL: 'auth/invalid-credential',
  AUTH_TOO_MANY_REQUESTS: 'auth/too-many-requests',
  AUTH_CONFIG_NOT_FOUND: 'auth/configuration-not-found',
  AUTH_NETWORK_FAILED: 'auth/network-request-failed',
  AUTH_REQUIRES_RECENT_LOGIN: 'auth/requires-recent-login',

  // Database errors (Firestore)
  DB_NOT_FOUND: 'db/not-found',
  DB_PERMISSION_DENIED: 'db/permission-denied',
  DB_UNAVAILABLE: 'db/unavailable',
  DB_DEADLINE_EXCEEDED: 'db/deadline-exceeded',
  DB_ALREADY_EXISTS: 'db/already-exists',
  DB_INVALID_ARGUMENT: 'db/invalid-argument',
  DB_RESOURCE_EXHAUSTED: 'db/resource-exhausted',
  DB_CANCELLED: 'db/cancelled',
  DB_UNKNOWN: 'db/unknown',

  // API errors (HTTP)
  API_BAD_REQUEST: 'api/bad-request',
  API_UNAUTHORIZED: 'api/unauthorized',
  API_FORBIDDEN: 'api/forbidden',
  API_NOT_FOUND: 'api/not-found',
  API_TIMEOUT: 'api/timeout',
  API_RATE_LIMITED: 'api/rate-limited',
  API_SERVER_ERROR: 'api/server-error',
  API_SERVICE_UNAVAILABLE: 'api/service-unavailable',
  API_NETWORK_ERROR: 'api/network-error',

  // Validation errors
  VALIDATION_REQUIRED: 'validation/required-field',
  VALIDATION_INVALID_FORMAT: 'validation/invalid-format',
  VALIDATION_OUT_OF_RANGE: 'validation/out-of-range',
  VALIDATION_TOO_SHORT: 'validation/too-short',
  VALIDATION_TOO_LONG: 'validation/too-long',

  // Storage errors
  STORAGE_QUOTA_EXCEEDED: 'storage/quota-exceeded',
  STORAGE_SECURITY_ERROR: 'storage/security-error',
  STORAGE_INVALID_DATA: 'storage/invalid-data',

  // Generic errors
  UNKNOWN_ERROR: 'error/unknown',
  NETWORK_ERROR: 'error/network',
  TIMEOUT_ERROR: 'error/timeout',
};

// User-friendly error messages
export const ERROR_MESSAGES = {
  // Auth messages
  [ERROR_CODES.AUTH_EMAIL_IN_USE]: 'An account with this email already exists',
  [ERROR_CODES.AUTH_INVALID_EMAIL]: 'Please enter a valid email address',
  [ERROR_CODES.AUTH_OPERATION_NOT_ALLOWED]: 'Email/password accounts are not enabled',
  [ERROR_CODES.AUTH_WEAK_PASSWORD]: 'Password should be at least 6 characters',
  [ERROR_CODES.AUTH_USER_DISABLED]: 'This account has been disabled',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'No account found with this email',
  [ERROR_CODES.AUTH_WRONG_PASSWORD]: 'Incorrect password',
  [ERROR_CODES.AUTH_INVALID_CREDENTIAL]: 'Invalid email or password',
  [ERROR_CODES.AUTH_TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later',
  [ERROR_CODES.AUTH_CONFIG_NOT_FOUND]: 'Firebase is not configured. Please set up your .env file with valid Firebase credentials',
  [ERROR_CODES.AUTH_NETWORK_FAILED]: 'Network error. Please check your connection',
  [ERROR_CODES.AUTH_REQUIRES_RECENT_LOGIN]: 'Please sign in again to complete this action',

  // Database messages
  [ERROR_CODES.DB_NOT_FOUND]: 'The requested data was not found',
  [ERROR_CODES.DB_PERMISSION_DENIED]: 'You do not have permission to access this data',
  [ERROR_CODES.DB_UNAVAILABLE]: 'Database service is temporarily unavailable. Please try again',
  [ERROR_CODES.DB_DEADLINE_EXCEEDED]: 'Request timed out. Please try again',
  [ERROR_CODES.DB_ALREADY_EXISTS]: 'This record already exists',
  [ERROR_CODES.DB_INVALID_ARGUMENT]: 'Invalid data provided',
  [ERROR_CODES.DB_RESOURCE_EXHAUSTED]: 'Service quota exceeded. Please try again later',
  [ERROR_CODES.DB_CANCELLED]: 'Operation was cancelled',
  [ERROR_CODES.DB_UNKNOWN]: 'A database error occurred. Please try again',

  // API messages
  [ERROR_CODES.API_BAD_REQUEST]: 'Invalid request. Please check your input',
  [ERROR_CODES.API_UNAUTHORIZED]: 'Authentication required. Please sign in',
  [ERROR_CODES.API_FORBIDDEN]: 'You do not have permission to perform this action',
  [ERROR_CODES.API_NOT_FOUND]: 'The requested resource was not found',
  [ERROR_CODES.API_TIMEOUT]: 'Request timed out. Please try again',
  [ERROR_CODES.API_RATE_LIMITED]: 'Too many requests. Please wait a moment and try again',
  [ERROR_CODES.API_SERVER_ERROR]: 'Server error. Please try again later',
  [ERROR_CODES.API_SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later',
  [ERROR_CODES.API_NETWORK_ERROR]: 'Network error. Please check your internet connection',

  // Validation messages
  [ERROR_CODES.VALIDATION_REQUIRED]: 'This field is required',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Invalid format',
  [ERROR_CODES.VALIDATION_OUT_OF_RANGE]: 'Value is out of acceptable range',
  [ERROR_CODES.VALIDATION_TOO_SHORT]: 'Input is too short',
  [ERROR_CODES.VALIDATION_TOO_LONG]: 'Input is too long',

  // Storage messages
  [ERROR_CODES.STORAGE_QUOTA_EXCEEDED]: 'Storage quota exceeded. Please clear some data',
  [ERROR_CODES.STORAGE_SECURITY_ERROR]: 'Storage access denied. This may be due to private browsing mode',
  [ERROR_CODES.STORAGE_INVALID_DATA]: 'Invalid data format',

  // Generic messages
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again',
};

/**
 * Get user-friendly error message from error code
 */
export const getErrorMessage = (errorCode) => {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
};

/**
 * Map Firebase Auth error codes to our error codes
 */
export const mapAuthErrorCode = (firebaseErrorCode) => {
  const authErrorMap = {
    'auth/email-already-in-use': ERROR_CODES.AUTH_EMAIL_IN_USE,
    'auth/invalid-email': ERROR_CODES.AUTH_INVALID_EMAIL,
    'auth/operation-not-allowed': ERROR_CODES.AUTH_OPERATION_NOT_ALLOWED,
    'auth/weak-password': ERROR_CODES.AUTH_WEAK_PASSWORD,
    'auth/user-disabled': ERROR_CODES.AUTH_USER_DISABLED,
    'auth/user-not-found': ERROR_CODES.AUTH_USER_NOT_FOUND,
    'auth/wrong-password': ERROR_CODES.AUTH_WRONG_PASSWORD,
    'auth/invalid-credential': ERROR_CODES.AUTH_INVALID_CREDENTIAL,
    'auth/too-many-requests': ERROR_CODES.AUTH_TOO_MANY_REQUESTS,
    'auth/configuration-not-found': ERROR_CODES.AUTH_CONFIG_NOT_FOUND,
    'auth/invalid-api-key': ERROR_CODES.AUTH_CONFIG_NOT_FOUND,
    'auth/network-request-failed': ERROR_CODES.AUTH_NETWORK_FAILED,
    'auth/requires-recent-login': ERROR_CODES.AUTH_REQUIRES_RECENT_LOGIN,
  };

  return authErrorMap[firebaseErrorCode] || ERROR_CODES.UNKNOWN_ERROR;
};

/**
 * Map Firestore error codes to our error codes
 */
export const mapFirestoreErrorCode = (firestoreError) => {
  // Firestore errors have a 'code' property
  const code = firestoreError?.code || '';

  const firestoreErrorMap = {
    'not-found': ERROR_CODES.DB_NOT_FOUND,
    'permission-denied': ERROR_CODES.DB_PERMISSION_DENIED,
    'unavailable': ERROR_CODES.DB_UNAVAILABLE,
    'deadline-exceeded': ERROR_CODES.DB_DEADLINE_EXCEEDED,
    'already-exists': ERROR_CODES.DB_ALREADY_EXISTS,
    'invalid-argument': ERROR_CODES.DB_INVALID_ARGUMENT,
    'resource-exhausted': ERROR_CODES.DB_RESOURCE_EXHAUSTED,
    'cancelled': ERROR_CODES.DB_CANCELLED,
  };

  return firestoreErrorMap[code] || ERROR_CODES.DB_UNKNOWN;
};

/**
 * Map HTTP status codes to our error codes
 */
export const mapHttpStatusCode = (statusCode) => {
  const httpStatusMap = {
    400: ERROR_CODES.API_BAD_REQUEST,
    401: ERROR_CODES.API_UNAUTHORIZED,
    403: ERROR_CODES.API_FORBIDDEN,
    404: ERROR_CODES.API_NOT_FOUND,
    408: ERROR_CODES.API_TIMEOUT,
    429: ERROR_CODES.API_RATE_LIMITED,
    500: ERROR_CODES.API_SERVER_ERROR,
    502: ERROR_CODES.API_SERVER_ERROR,
    503: ERROR_CODES.API_SERVICE_UNAVAILABLE,
    504: ERROR_CODES.API_TIMEOUT,
  };

  return httpStatusMap[statusCode] || ERROR_CODES.API_SERVER_ERROR;
};

/**
 * Create standardized error response object
 */
export const createErrorResponse = (errorCode, customMessage = null) => {
  return {
    success: false,
    error: customMessage || getErrorMessage(errorCode),
    errorCode: errorCode,
  };
};

/**
 * Handle API/HTTP errors and return standardized response
 */
export const handleApiError = (error) => {
  // Check for network errors
  if (error.message === 'Network Error' || !error.response) {
    return createErrorResponse(ERROR_CODES.API_NETWORK_ERROR);
  }

  // Check for timeout
  if (error.code === 'ECONNABORTED') {
    return createErrorResponse(ERROR_CODES.API_TIMEOUT);
  }

  // Map HTTP status code
  const statusCode = error.response?.status;
  const errorCode = mapHttpStatusCode(statusCode);

  return createErrorResponse(errorCode);
};

/**
 * Handle Firestore errors and return standardized response
 */
export const handleFirestoreError = (error) => {
  const errorCode = mapFirestoreErrorCode(error);
  return createErrorResponse(errorCode);
};

/**
 * Handle storage errors and return standardized response
 */
export const handleStorageError = (error) => {
  if (error.name === 'QuotaExceededError') {
    return createErrorResponse(ERROR_CODES.STORAGE_QUOTA_EXCEEDED);
  }

  if (error.name === 'SecurityError') {
    return createErrorResponse(ERROR_CODES.STORAGE_SECURITY_ERROR);
  }

  if (error instanceof SyntaxError) {
    return createErrorResponse(ERROR_CODES.STORAGE_INVALID_DATA);
  }

  return createErrorResponse(ERROR_CODES.UNKNOWN_ERROR);
};

export default {
  ERROR_CODES,
  ERROR_MESSAGES,
  getErrorMessage,
  mapAuthErrorCode,
  mapFirestoreErrorCode,
  mapHttpStatusCode,
  createErrorResponse,
  handleApiError,
  handleFirestoreError,
  handleStorageError,
};
