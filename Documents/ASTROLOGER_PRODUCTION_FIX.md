# Astrologer Portal - Production Deployment Fix

## Problem
When accessing the deployed astrologer portal at:
`https://astrology-astrologer-j2roijfx9-bhanuballias-projects.vercel.app/astrologer/login`

You get the error:
```
Server error: 404. Please ensure the backend server is running on the correct port.
```

## Root Cause
The deployed astrologer portal was trying to connect to `localhost:5000` (which doesn't exist in production) instead of your production backend at `https://astrology-backend-pink.vercel.app`.

## Solution

### What I Fixed
Updated `astrologer/src/services/api.js` to automatically detect the environment:
- **Development (localhost)**: Uses `http://localhost:5000/api`
- **Production (Vercel)**: Uses `https://astrology-backend-pink.vercel.app/api`

### Step 1: Redeploy the Astrologer Portal

You need to redeploy the astrologer portal with the updated code.

#### Option A: Deploy via Vercel CLI (Recommended)

```bash
cd "c:\Users\User\Desktop\Astrology - run\astrologer"
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your astrologer portal project
3. Click on the project
4. Go to the "Deployments" tab
5. Click "Redeploy" on the latest deployment
6. OR: Push your changes to Git and Vercel will auto-deploy

### Step 2: Verify Environment Variables (Optional)

If you want to explicitly set the backend URL in Vercel:

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add a new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://astrology-backend-pink.vercel.app/api`
   - **Environment**: Production

### Step 3: Test the Deployment

After redeployment:
1. Visit your astrologer portal URL
2. Try logging in with an astrologer account
3. The login should now connect to the production backend

## Important Notes

### Backend CORS Configuration
Make sure your backend allows requests from your astrologer portal domain. Check `backend/server.js` for CORS settings:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-frontend-domain.vercel.app',
    'https://astrology-astrologer-j2roijfx9-bhanuballias-projects.vercel.app'
  ],
  credentials: true
};
```

### Environment Detection Logic

The updated code automatically detects:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://astrology-backend-pink.vercel.app/api');
```

This means:
- ✅ Works locally without any configuration
- ✅ Works in production without environment variables
- ✅ Can be overridden with `VITE_API_BASE_URL` if needed

## Quick Deploy Commands

### Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy to Production
```bash
cd "c:\Users\User\Desktop\Astrology - run\astrologer"
vercel --prod
```

## Troubleshooting

### Issue: Still getting 404 error after redeployment
**Solution**: 
1. Clear browser cache (Ctrl + Shift + Delete)
2. Open browser DevTools (F12) → Network tab
3. Check what URL the app is calling
4. Verify the backend is accessible at `https://astrology-backend-pink.vercel.app/api/auth/login`

### Issue: CORS error instead of 404
**Solution**: Update backend CORS configuration to allow your astrologer portal domain

### Issue: "Invalid role for astrologer portal"
**Solution**: Make sure you're logging in with an account that has `role: 'astrologer'`

## Testing Checklist

After deployment, verify:
- [ ] Astrologer portal loads without errors
- [ ] Login form is visible
- [ ] Login with astrologer credentials works
- [ ] Dashboard loads after login
- [ ] API calls are going to production backend (check Network tab)

## Production URLs

- **Backend API**: https://astrology-backend-pink.vercel.app/api
- **Astrologer Portal**: https://astrology-astrologer-j2roijfx9-bhanuballias-projects.vercel.app
- **Main Frontend**: (Add your main frontend URL here)

---

**Status**: ✅ Code updated and ready to deploy
**Next Step**: Run `vercel --prod` in the astrologer folder
