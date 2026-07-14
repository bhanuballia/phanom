# 🤖 Automated Deployment Scripts

Quick commands to deploy your astrology application.

## 📦 Prerequisites

Install required CLI tools:

```bash
# Install Vercel CLI (for frontend)
npm install -g vercel

# Install Render CLI (optional, for backend)
npm install -g render

# Or use Git-based deployment (recommended)
```

---

## 🚀 Quick Deploy Commands

### 1. Build Frontend Locally

```bash
cd frontend
npm install
npm run build
```

### 2. Deploy Frontend to Vercel

```bash
cd frontend
vercel --prod
```

### 3. Deploy Frontend to Netlify

```bash
cd frontend
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

---

## 🔧 Backend Deployment (Git-based)

### Using Render (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **In Render Dashboard**:
   - New Web Service → Connect Repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

### Using Railway

1. **Push to GitHub** (same as above)

2. **In Railway Dashboard**:
   - New Project → Deploy from GitHub
   - Select repository
   - Railway auto-detects Node.js

---

## 📝 Environment Variables Setup Scripts

### Backend .env Template

Create `backend/.env.example`:

```env
# Copy this file to .env and fill in your values

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/astrology?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Server Configuration
PORT=8000
NODE_ENV=production

# Frontend URL (Update after frontend deployment)
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend .env.production Template

Create `frontend/.env.production`:

```env
# Update these after backend deployment
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

---

## 🔄 Update CORS Script

Add this to your `backend/server.js` if not already present:

```javascript
// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Socket.IO CORS
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

---

## 🧪 Testing Scripts

### Test Backend Locally

```bash
cd backend
npm install
npm run dev
```

### Test Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

### Test Production Build Locally

```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend
cd backend
NODE_ENV=production npm start
```

---

## 🔗 Quick Links Setup

After deployment, update your `README.md`:

```markdown
# Astrology Application

## 🌐 Live Application

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-backend.onrender.com
- **API Documentation**: https://your-backend.onrender.com/api-docs

## 🚀 Quick Start

Visit [https://your-app.vercel.app](https://your-app.vercel.app) to use the application.
```

---

## 🐳 Docker Deployment (Advanced)

### Dockerfile for Backend

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
```

### Dockerfile for Frontend

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (Full Stack)

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

Run with:
```bash
docker-compose up -d
```

---

## 📊 Monitoring Setup

### Add Health Check Endpoint

Add to `backend/server.js`:

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Uptime Monitoring Services

- **UptimeRobot**: [https://uptimerobot.com/](https://uptimerobot.com/) (Free)
- **Pingdom**: [https://www.pingdom.com/](https://www.pingdom.com/)
- **StatusCake**: [https://www.statuscake.com/](https://www.statuscake.com/)

---

## 🔄 Continuous Deployment

### GitHub Actions (Automatic Deployment)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        # Render auto-deploys from GitHub
        run: echo "Backend auto-deploys via Render"
```

---

## 🎯 One-Command Deployment

Create `deploy.sh` in root:

```bash
#!/bin/bash

echo "🚀 Starting deployment process..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Deploy to Vercel
echo "🌐 Deploying frontend to Vercel..."
vercel --prod

# Get backend URL
echo "🔗 Backend deploys automatically via Git"
echo "✅ Deployment complete!"
echo "📝 Don't forget to update environment variables!"
```

Make executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📱 Mobile App Deployment (Future)

If you want to convert to mobile app:

- **Capacitor**: [https://capacitorjs.com/](https://capacitorjs.com/)
- **React Native**: [https://reactnative.dev/](https://reactnative.dev/)

---

## 🎉 Post-Deployment

After successful deployment:

1. ✅ Test all features
2. ✅ Set up monitoring
3. ✅ Configure custom domain (optional)
4. ✅ Enable analytics
5. ✅ Share with users!

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
