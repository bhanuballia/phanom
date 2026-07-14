# Astrologer Login Error Fix

## Problem
When trying to login at AstrologerLogin, you're getting the error:
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## Root Cause
This error occurs when the frontend tries to parse an HTML response (like a 404 error page) as JSON. This happens because:
1. **Backend server is not running** on port 5000
2. The API endpoint returns an HTML error page instead of JSON

## Solution

### Step 1: Start the Backend Server
The backend server must be running for the astrologer portal to work.

**Open a terminal in the backend folder and run:**
```bash
cd backend
npm start
```

The backend should start on `http://localhost:5000`

### Step 2: Start the Astrologer Portal
**Open another terminal in the astrologer folder and run:**
```bash
cd astrologer
npm run dev
```

The astrologer portal should start on `http://localhost:3001`

### Step 3: Verify the Setup
1. Check that the backend is running by visiting: `http://localhost:5000/api/auth/astrologers`
2. You should see a JSON response with astrologers list
3. Now try logging in to the astrologer portal at: `http://localhost:3001`

## What I Fixed

### 1. Enhanced Error Handling in API Service
Updated `astrologer/src/services/api.js` to:
- Detect when the server returns HTML instead of JSON
- Provide clear error messages about the backend not running
- Better logging for debugging

### 2. Created Environment Configuration
Created `astrologer/.env` file with:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

This ensures the astrologer portal connects to the correct backend URL.

## For Production Deployment

When deploying to Vercel or another hosting service:

1. Update the `.env` file in the astrologer portal:
```env
VITE_API_BASE_URL=https://astrology-backend-pink.vercel.app/api
```

2. Rebuild the astrologer portal:
```bash
npm run build
```

## Testing Login

To test the astrologer login:
1. Make sure you have an astrologer account registered
2. Use the credentials to login at the astrologer portal
3. The system will check if the user role is 'astrologer'

## Common Issues

### Issue: "Server error: 404"
**Solution:** Backend is not running. Start it with `npm start` in the backend folder.

### Issue: "CORS error"
**Solution:** Make sure the backend CORS configuration allows requests from `http://localhost:3001`

### Issue: "Invalid role for astrologer portal"
**Solution:** The user account must have `role: 'astrologer'`. Register a new account with the astrologer role.

## Quick Start Commands

**Terminal 1 (Backend):**
```bash
cd "c:\Users\User\Desktop\Astrology - run\backend"
npm start
```

**Terminal 2 (Astrologer Portal):**
```bash
cd "c:\Users\User\Desktop\Astrology - run\astrologer"
npm run dev
```

**Terminal 3 (Main Frontend - Optional):**
```bash
cd "c:\Users\User\Desktop\Astrology - run\frontend"
npm run dev
```
