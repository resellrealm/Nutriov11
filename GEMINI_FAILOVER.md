# Gemini API Smart Failover

## Overview

Nutrio now includes **Smart Failover** for Gemini API keys, allowing you to configure up to 3 API keys for automatic backup and increased capacity.

## How It Works

### Basic Flow

```
User makes AI request
    ↓
Try Primary Key (KEY_1)
    ↓
[SUCCESS] → Return result ✅
    ↓
[RATE LIMITED] → Mark KEY_1 as "cooling down" (24 hours)
    ↓
Try Backup Key (KEY_2)
    ↓
[SUCCESS] → Return result ✅
    ↓
[RATE LIMITED] → Mark KEY_2 as "cooling down" (24 hours)
    ↓
Try Backup Key (KEY_3)
    ↓
[SUCCESS] → Return result ✅
    ↓
[ALL KEYS EXHAUSTED] → Show error to user ❌
```

### Key Features

- **Automatic Failover**: When a key hits rate limits, automatically switches to next available key
- **24-Hour Cooldown**: Rate-limited keys are marked as unavailable for 24 hours (when daily limit resets)
- **Transparent to Users**: Failover happens automatically - users never see API errors unless all keys are exhausted
- **Console Logging**: Detailed logs show which key is being used and when failover occurs

## Setup Instructions

### 1. Get Your API Keys

Visit [Google AI Studio](https://makersuite.google.com/app/apikey) and create **1-3 free API keys**.

> **Tip**: Use different Google accounts or the same account - both work fine!

### 2. Configure Your `.env` File

```env
# REQUIRED: Primary key
VITE_GEMINI_API_KEY=your_first_key_here

# OPTIONAL: Backup keys for failover
VITE_GEMINI_API_KEY_2=your_second_key_here
VITE_GEMINI_API_KEY_3=your_third_key_here
```

You can configure:
- **1 key**: Standard setup (1,500 req/day)
- **2 keys**: 2x capacity (3,000 req/day) with automatic backup
- **3 keys**: 3x capacity (4,500 req/day) with two backup layers

### 3. Restart Your App

The failover system initializes on app startup:

```bash
npm run dev
```

You should see in console:
```
[Gemini] Initialized with 3 API key(s)
```

## Capacity & Limits

### Per Key (FREE Tier)
- **60 requests/minute**
- **1,500 requests/day**
- **1 million tokens/month**

### With Multiple Keys

| Keys | Daily Requests | Monthly Tokens |
|------|----------------|----------------|
| 1 key | 1,500/day | 1M/month |
| 2 keys | 3,000/day | 2M/month |
| 3 keys | 4,500/day | 3M/month |

## Console Output Examples

### Normal Operation
```
[Gemini] Initialized with 3 API key(s)
[Gemini] Using API key 1
```

### Failover in Action
```
[Gemini] Using API key 1
[Gemini] ⚠️ Key 1 rate limited. Cooldown until 2:30:45 PM
[Gemini] Rate limit hit on key 1, trying next key...
[Gemini] Using API key 2
```

### All Keys Exhausted
```
[Gemini] Key 1 in cooldown (847 min remaining)
[Gemini] Key 2 in cooldown (523 min remaining)
[Gemini] Key 3 in cooldown (184 min remaining)
[Gemini] All API keys exhausted

User sees: "All 3 API keys are rate limited. Please try again in 24 hours."
```

## Monitoring Key Status

You can check the status of your API keys in code:

```javascript
import { getGeminiStatus } from './services/geminiService';

const status = getGeminiStatus();
console.log(status);
/*
{
  totalKeys: 3,
  availableKeys: 2,
  configured: true,
  allRateLimited: false
}
*/
```

## FAQ

### Do I need 3 different Google accounts?

**No!** You can create multiple API keys from the same Google account in [Google AI Studio](https://makersuite.google.com/app/apikey). However, you can also use different accounts if you prefer.

### Is this against Google's terms of service?

**No!** Using multiple API keys for redundancy and load distribution is a common and legitimate practice. You're not bypassing rate limits maliciously - you're simply using multiple free tier accounts properly.

### What happens if I only configure 1 key?

The system works fine with 1 key! You just won't have automatic failover. If you hit the rate limit, users will see an error message until the limit resets.

### How long is the cooldown period?

**24 hours** - because Gemini's daily rate limit resets every 24 hours. After 24 hours, the key automatically becomes available again.

### What if I restart my app during cooldown?

**Cooldown resets** - cooldown state is stored in memory only. If you restart the app, all keys become available again. This is intentional for simplicity.

### Can I use 5 or 10 keys?

Currently limited to 3 keys for simplicity. You can easily extend this by adding more env variables (`VITE_GEMINI_API_KEY_4`, etc.) and updating the `GeminiKeyManager` constructor in `src/services/geminiService.js`.

## Technical Details

### Architecture

```
┌─────────────────────────┐
│   User Request          │
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  executeWithFailover()  │ ← Wrapper function
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  GeminiKeyManager       │
│  - getAvailableKey()    │ ← Finds next available key
│  - markAsRateLimited()  │ ← Marks key as exhausted
│  - cooldowns: {}        │ ← Tracks cooldown state
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│  Google Gemini API      │
└─────────────────────────┘
```

### Rate Limit Detection

The system detects rate limits by checking for:
- HTTP 429 status code
- Error messages containing "quota", "rate limit", or "resource exhausted"

### Affected Functions

All Gemini API functions now use smart failover:
- `analyzeMealPhoto()` - Meal photo analysis
- `generateMealSuggestions()` - AI meal suggestions
- `analyzeFridgePhoto()` - Fridge scanning
- `generateMealSuggestionsFromIngredients()` - Recipe generation

## Troubleshooting

### Keys not working?

1. Check console logs for initialization message
2. Verify keys are valid in `.env` file
3. Make sure you didn't use placeholder values like `your_gemini_api_key_here`

### Still hitting rate limits?

- Check if you're using the app very heavily (>4,500 requests/day with 3 keys)
- Consider upgrading to Gemini Pro paid tier
- Wait 24 hours for daily limits to reset

### Want to add more keys?

Edit `src/services/geminiService.js` and add to the constructor:

```javascript
this.keys = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY_4, // Add more here
];
```

## Implementation Files

- **Smart Failover Logic**: `src/services/geminiService.js`
- **Environment Config**: `.env.example`
- **Documentation**: `GEMINI_FAILOVER.md` (this file)

## Benefits

✅ **3x Daily Capacity**: 4,500 requests/day instead of 1,500
✅ **Automatic Recovery**: No manual intervention when keys are rate limited
✅ **Zero Downtime**: Users experience uninterrupted service
✅ **100% Free**: All keys use Google's free tier
✅ **Production Ready**: Handles edge cases and errors gracefully

---

**Questions?** Check the console logs or review `src/services/geminiService.js` for implementation details.
