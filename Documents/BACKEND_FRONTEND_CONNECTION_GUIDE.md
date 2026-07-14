# 🔗 Backend & Frontend Connection Guide

Complete guide to connect your React frontend with Node.js backend for both **local development** and **production deployment**.

---

## 📋 Current Setup Overview

### **Backend**
- **Location**: `c:\Users\User\Desktop\Astrology - run\backend\`
- **Port**: `5000` (configured in `.env`)
- **Base URL**: `http://localhost:5000`
- **API Endpoints**: `http://localhost:5000/api/*`

### **Frontend**
- **Location**: `c:\Users\User\Desktop\Astrology - run\frontend\`
- **Port**: `5173` (Vite default)
- **API Configuration**: `src/services/api.js`
- **Environment Variable**: `VITE_API_BASE_URL`

---

## 🏠 LOCAL DEVELOPMENT CONNECTION

### **Step 1: Configure Backend**

Your backend is already configured correctly! It's running on port `5000`.

**File**: `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://singhdevesh2k:Bhanu361@clusterastro.msfazvd.mongodb.net/
JWT_SECRET=902a98da8e6ae050fac68e91448e7abd
GEMINI_API_KEY=AIzaSyC1KHo3Xu7jxFceR65LOw3R_-d6zSb01HI
```

### **Step 2: Configure Frontend**

Update your frontend `.env` file to point to the backend:

**File**: `frontend/.env`
```env
# Backend API URL (Local Development)
VITE_API_BASE_URL=http://localhost:5000/api

# Lal Kitab API Configuration
VITE_LAL_KITAB_API_KEY=your_api_key_here
VITE_LAL_KITAB_USER_ID=your_user_id_here
```

### **Step 3: Update Backend CORS**

Make sure your backend allows requests from the frontend:

**File**: `backend/server.js`

Find the CORS configuration and ensure it includes:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Alternative port
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL  // Production URL
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### **Step 4: Start Both Servers**

**Terminal 1 - Backend:**
```bash
cd "c:\Users\User\Desktop\Astrology - run\backend"
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "c:\Users\User\Desktop\Astrology - run\frontend"
npm install
npm run dev
```

### **Step 5: Test the Connection**

1. Open browser: `http://localhost:5173`
2. Open browser console (F12)
3. Try logging in or making any API call
4. Check console for API responses

---

## 🌐 PRODUCTION DEPLOYMENT CONNECTION

### **Option 1: Separate Hosting (Recommended)**

Deploy backend and frontend on different platforms.

#### **Backend on Render**

1. **Deploy Backend First**
   - Go to [https://dashboard.render.com](https://dashboard.render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Settings:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`

2. **Add Environment Variables on Render:**
   ```env
   MONGODB_URI=mongodb+srv://singhdevesh2k:Bhanu361@clusterastro.msfazvd.mongodb.net/
   JWT_SECRET=902a98da8e6ae050fac68e91448e7abd
   GEMINI_API_KEY=AIzaSyC1KHo3Xu7jxFceR65LOw3R_-d6zSb01HI
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

3. **Get Backend URL**
   - After deployment, you'll get: `https://astrology-backend-xxxx.onrender.com`
   - Copy this URL!

#### **Frontend on Vercel**

1. **Create Production Environment File**

   **File**: `frontend/.env.production`
   ```env
   # Production Backend URL (from Render)
   VITE_API_BASE_URL=https://astrology-backend-xxxx.onrender.com/api
   
   # Lal Kitab API
   VITE_LAL_KITAB_API_KEY=your_api_key_here
   VITE_LAL_KITAB_USER_ID=your_user_id_here
   ```

2. **Deploy to Vercel**
   - Go to [https://vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Settings:
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables:
     - `VITE_API_BASE_URL` = `https://astrology-backend-xxxx.onrender.com/api`

3. **Get Frontend URL**
   - After deployment: `https://astrology-app-xxxx.vercel.app`

#### **Update Backend CORS**

After getting your frontend URL, update backend environment variables on Render:

```env
FRONTEND_URL=https://astrology-app-xxxx.vercel.app
```

And update your `backend/server.js` CORS:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://astrology-app-xxxx.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

### **Option 2: Same Domain Deployment**

Deploy both on the same platform (more complex but cleaner URLs).

This requires setting up a proxy or monorepo structure. Not recommended for beginners.

---

## 🔧 HOW THE CONNECTION WORKS

### **Frontend API Configuration**

Your frontend uses `src/services/api.js` which automatically:

1. **Reads environment variable**: `VITE_API_BASE_URL`
2. **Falls back to localhost**: If not set, uses `http://localhost:5000/api`
3. **Creates axios instance**: With the base URL
4. **Adds authentication**: Automatically adds JWT token to requests
5. **Handles errors**: Redirects to login on 401 errors

### **Example API Call Flow**

```javascript
// Frontend makes a call
import { authAPI } from './services/api';

const response = await authAPI.login({ email, password });

// This translates to:
// POST http://localhost:5000/api/auth/login (local)
// POST https://backend.onrender.com/api/auth/login (production)
```

---

## ✅ CONNECTION CHECKLIST

### **Local Development**
- [ ] Backend `.env` has `PORT=5000`
- [ ] Frontend `.env` has `VITE_API_BASE_URL=http://localhost:5000/api`
- [ ] Backend CORS allows `http://localhost:5173`
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can make API calls successfully

### **Production Deployment**
- [ ] Backend deployed to Render (or similar)
- [ ] Backend URL copied
- [ ] Frontend `.env.production` has production backend URL
- [ ] Frontend deployed to Vercel (or similar)
- [ ] Frontend URL copied
- [ ] Backend CORS updated with frontend URL
- [ ] Backend environment variable `FRONTEND_URL` set
- [ ] Can make API calls successfully

---

## 🐛 TROUBLESHOOTING

### **Error: "Network Error" or "Failed to fetch"**

**Cause**: Frontend can't reach backend

**Solutions**:
1. Check backend is running: `http://localhost:5000/api`
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Restart frontend dev server after changing `.env`

### **Error: "CORS policy blocked"**

**Cause**: Backend not allowing frontend origin

**Solutions**:
1. Check backend CORS configuration
2. Add frontend URL to CORS origins
3. Restart backend server

### **Error: "401 Unauthorized"**

**Cause**: JWT token expired or invalid

**Solutions**:
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Check JWT_SECRET is same in backend

### **Error: "Cannot connect to MongoDB"**

**Cause**: Database connection issue

**Solutions**:
1. Check `MONGODB_URI` in backend `.env`
2. Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
3. Check database user credentials

---

## 📊 ENVIRONMENT VARIABLES SUMMARY

### **Backend (.env)**
```env
# Required
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development  # or production

# Optional but recommended
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Production only
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### **Frontend (.env for local)**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_LAL_KITAB_API_KEY=your_api_key
VITE_LAL_KITAB_USER_ID=your_user_id
```

### **Frontend (.env.production for deployment)**
```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_LAL_KITAB_API_KEY=your_api_key
VITE_LAL_KITAB_USER_ID=your_user_id
```

---

## 🎯 QUICK START COMMANDS

### **Local Development**

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

### **Production Build Test**

```bash
# Build frontend with production settings
cd frontend
npm run build
npm run preview

# Start backend in production mode
cd backend
NODE_ENV=production npm start
```

---

## 🔐 SECURITY NOTES

1. **Never commit `.env` files** to Git
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Whitelist specific origins** in production CORS
4. **Use HTTPS** in production (automatic on Vercel/Render)
5. **Rotate API keys** regularly

---

## 📞 NEXT STEPS

1. ✅ Test local connection
2. ✅ Deploy backend to Render
3. ✅ Update frontend with backend URL
4. ✅ Deploy frontend to Vercel
5. ✅ Update backend CORS with frontend URL
6. ✅ Test production connection

---

**Your frontend and backend are now connected! 🎉**

For deployment help, see:
- `HOSTING_QUICK_START.md` - Quick deployment guide
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `DEPLOYMENT_CHECKLIST.md` - Complete checklist
