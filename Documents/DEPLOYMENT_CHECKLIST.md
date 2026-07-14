# ✅ Pre-Deployment Checklist

Use this checklist to ensure your astrology application is ready for deployment.

## 🗄️ Database Setup

- [ ] Create MongoDB Atlas account
- [ ] Create a new cluster (Free M0 tier)
- [ ] Create database user with password
- [ ] Whitelist IP addresses (0.0.0.0/0 for all)
- [ ] Get connection string
- [ ] Test connection locally

## 🔧 Backend Preparation

- [ ] Create `.env` file with all required variables
- [ ] Update CORS to accept production frontend URL
- [ ] Update Socket.IO CORS settings
- [ ] Test all API endpoints locally
- [ ] Ensure `package.json` has correct start script
- [ ] Remove any hardcoded localhost URLs
- [ ] Add error handling for production
- [ ] Set up proper logging

### Backend Environment Variables Needed:
```
MONGODB_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
GEMINI_API_KEY=
PORT=8000
NODE_ENV=production
FRONTEND_URL=
```

## 🎨 Frontend Preparation

- [ ] Create `.env.production` file
- [ ] Update all API calls to use environment variables
- [ ] Update Socket.IO connection URL
- [ ] Test build locally (`npm run build`)
- [ ] Check for console errors
- [ ] Optimize images and assets
- [ ] Remove debug console.logs
- [ ] Test responsive design

### Frontend Environment Variables Needed:
```
VITE_API_URL=
VITE_SOCKET_URL=
```

## 🚀 Deployment Steps

### Step 1: Deploy Database
- [ ] MongoDB Atlas cluster is running
- [ ] Connection string copied
- [ ] Database accessible from anywhere

### Step 2: Deploy Backend
- [ ] Choose hosting platform (Render/Railway/etc.)
- [ ] Create new web service
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Add all environment variables
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Deploy and wait for build
- [ ] Copy backend URL
- [ ] Test API endpoints (use Postman or browser)

### Step 3: Deploy Frontend
- [ ] Update `.env.production` with backend URL
- [ ] Build locally to test: `npm run build`
- [ ] Choose hosting platform (Vercel/Netlify/etc.)
- [ ] Connect GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Add environment variables
- [ ] Deploy and wait for build
- [ ] Copy frontend URL

### Step 4: Update CORS
- [ ] Add frontend URL to backend CORS settings
- [ ] Redeploy backend if needed
- [ ] Test cross-origin requests

## 🧪 Post-Deployment Testing

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] JWT authentication works
- [ ] API calls return data
- [ ] Socket.IO real-time features work
- [ ] Chat functionality works
- [ ] Astrology chart generation works
- [ ] PDF generation works
- [ ] File uploads work
- [ ] Email notifications work (if applicable)
- [ ] SMS notifications work (if applicable)
- [ ] All pages are accessible
- [ ] Mobile responsiveness works
- [ ] No console errors

## 🔒 Security Checklist

- [ ] All sensitive data in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] Strong JWT secret (minimum 32 characters)
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL/NoSQL injection protection
- [ ] XSS protection

## 📊 Performance Optimization

- [ ] Images optimized and compressed
- [ ] Lazy loading implemented
- [ ] Code splitting enabled
- [ ] Minification enabled in production
- [ ] Gzip compression enabled
- [ ] CDN configured (automatic on Vercel/Netlify)
- [ ] Database indexes created
- [ ] API response caching where appropriate

## 📝 Documentation

- [ ] README.md updated with live URLs
- [ ] API documentation created
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] User guide created (if needed)

## 🎯 Final Steps

- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified
- [ ] Analytics set up (Google Analytics, etc.)
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Backup strategy in place
- [ ] Monitoring/uptime checks configured

## 🐛 Troubleshooting Common Issues

### Backend won't start
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check logs for specific errors
- Ensure PORT is set correctly

### Frontend can't connect to backend
- Verify CORS settings include frontend URL
- Check API URL in frontend environment variables
- Ensure backend is running and accessible
- Check browser console for CORS errors

### Socket.IO not working
- Verify Socket.IO CORS settings
- Check socket URL in frontend
- Ensure WebSocket connections are allowed
- Check firewall/proxy settings

### Database connection fails
- Verify MongoDB connection string
- Check database user credentials
- Ensure IP whitelist includes 0.0.0.0/0
- Verify network access in MongoDB Atlas

## 📞 Support Resources

- **Render Support**: [https://render.com/docs](https://render.com/docs)
- **Vercel Support**: [https://vercel.com/support](https://vercel.com/support)
- **MongoDB Support**: [https://www.mongodb.com/community/forums/](https://www.mongodb.com/community/forums/)

---

## 🎉 Deployment Complete!

Once all items are checked, your application is live and ready for users!

**Share your live URL**: `https://your-app.vercel.app`

---

**Estimated Total Time**: 1-2 hours for first deployment
**Subsequent Deployments**: 5-10 minutes (automatic with Git integration)
