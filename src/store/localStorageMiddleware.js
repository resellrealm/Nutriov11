/**
 * Redux middleware for syncing state to localStorage
 * This keeps reducers pure by handling side effects in middleware
 */

const localStorageMiddleware = () => next => action => {
  const result = next(action);

  // Handle localStorage synchronization based on action types
  switch (action.type) {
    case 'auth/logout': {
      // Clear auth-related localStorage keys
      const authKeys = [
        'token', 'user', 'onboardingComplete', 'isPremium',
        'dailyScansUsed', 'lastScanDate', 'planTier', 'onboarding_progress',
        'scanCooldownUntil', 'lastScanTimestamp'
      ];
      authKeys.forEach(key => localStorage.removeItem(key));
      sessionStorage.clear();
      break;
    }

    case 'auth/setOnboardingComplete': {
      if (action.payload) {
        localStorage.setItem('onboardingComplete', 'true');
      }
      break;
    }

    case 'auth/setPremiumStatus': {
      localStorage.setItem('isPremium', action.payload.toString());
      localStorage.setItem('planTier', action.payload ? 'premium' : 'free');
      break;
    }

    case 'auth/incrementDailyScans': {
      // Get the updated state after the reducer has run
      const state = result.getState?.()?.auth;
      if (state) {
        localStorage.setItem('dailyScansUsed', state.dailyScansUsed.toString());
        localStorage.setItem('lastScanDate', state.lastScanDate);
        localStorage.setItem('lastScanTimestamp', state.lastScanTimestamp.toString());

        if (state.scanCooldownUntil) {
          localStorage.setItem('scanCooldownUntil', state.scanCooldownUntil.toString());
        } else {
          localStorage.removeItem('scanCooldownUntil');
        }
      }
      break;
    }

    case 'auth/resetDailyScans': {
      const state = result.getState?.()?.auth;
      if (state) {
        localStorage.setItem('dailyScansUsed', '0');
        localStorage.setItem('lastScanDate', state.lastScanDate);
        localStorage.removeItem('scanCooldownUntil');
      }
      break;
    }

    case 'auth/clearCooldown': {
      localStorage.removeItem('scanCooldownUntil');
      break;
    }

    default:
      break;
  }

  return result;
};

export default localStorageMiddleware;
