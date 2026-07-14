# Lal Kitab API Integration

## Overview
This document explains how to integrate and use the Lal Kitab horoscope API from https://json.astrologyapi.com/v1/lalkitab_horoscope in the astrology platform.

## Setup Instructions

### 1. Obtain API Credentials
To use the Lal Kitab API, you need to:
1. Sign up at https://www.astrologyapi.com/
2. Obtain your `user_id` and `api_key`

### 2. Configure Environment Variables
Add the following to your `.env` file in the frontend directory:
```env
VITE_LAL_KITAB_API_KEY=your_actual_api_key
VITE_LAL_KITAB_USER_ID=your_actual_user_id
```

### 3. API Endpoints Used
The integration uses the following Lal Kitab API endpoints:
- `/lalkitab_horoscope` - Get complete horoscope predictions
- `/lalkitab_planets` - Get planetary positions
- `/lalkitab_predictions` - Get specific predictions

## Implementation Details

### Frontend Service
The API integration is implemented in:
- `frontend/src/services/lalKitabAPI.js` - Service layer for API calls
- `frontend/src/pages/LalKitab.jsx` - UI component for user interaction

### Features
1. **Birth Details Form** - Collects user's birth information
2. **Horoscope Generation** - Fetches Lal Kitab predictions
3. **Results Display** - Shows predictions, remedies, and planetary positions
4. **Error Handling** - Comprehensive error handling for API issues
5. **Loading States** - Visual feedback during API requests

## Usage
1. Navigate to the Lal Kitab page in the application
2. Fill in the birth details form
3. Click "Generate Lal Kitab" to fetch the horoscope
4. View the predictions, remedies, and planetary positions

## Error Handling
The integration handles various error scenarios:
- Network issues
- Invalid credentials
- Rate limiting
- Server errors
- Missing required data

## Customization
To customize the integration:
1. Modify the UI components in `LalKitab.jsx`
2. Extend the service in `lalKitabAPI.js` for additional endpoints
3. Adjust the display format of horoscope data as needed