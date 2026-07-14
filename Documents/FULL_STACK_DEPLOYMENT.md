# 🚀 Full Stack Deployment Guide for Astrology App

This guide covers hosting all three parts of your application:
1.  **Backend** (Node.js/Express) -> Hosted on **Render** (Free Tier available)
2.  **User Frontend** (React/Vite) -> Hosted on **Vercel** (Free Tier available)
3.  **Astrologer Portal** (React/Vite) -> Hosted on **Vercel** (Free Tier available)

---

## ✅ Prerequisites

1.  **GitHub Account**: Your project must be pushed to a GitHub repository.
2.  **MongoDB Atlas Account**: A cloud database.
3.  **Render Account**: For hosting the backend.
4.  **Vercel Account**: For hosting the frontends.

---

## Step 1: Push Code to GitHub

Ensure all your folders (`backend`, `frontend`, `astrologer`) are in **one single GitHub repository**.
If you haven't done this yet:
1.  Initialize git in the root folder: `git init`
2.  Add all files: `git add .`
3.  Commit: `git commit -m "Initial commit"`
4.  Push to a new GitHub repository.

---

## Step 2: Database Setup (MongoDB Atlas)

1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a **Cluster** (The free M0 tier is sufficient).
3.  Go to **Network Access** -> Add IP Address -> Allow Access from Anywhere (`0.0.0.0/0`).
4.  Go to **Database Access** -> Create a Database User (Username/Password).
5.  Click **Connect** -> Drivers -> Copy the connection string.
    *   It looks like: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
    *   Replace `<password>` with your actual password.

---

## Step 3: Deploy Backend (Render)

1.  Log in to [Render](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `astrology-backend` (or similar)
    *   **Region**: Closest to you (e.g., Singapore/Ohio).
    *   **Root Directory**: `backend` (⚠️ IMPORTANT)
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  Scroll down to **Environment Variables** and add:
    *   `MONGODB_URI`: Paste your MongoDB connection string from Step 2.
    *   `PORT`: `5000` (Render will override this, but good to have).
    *   `FRONTEND_URL`: `*` (Allows all origins initially to prevent CORS errors. You can restrict this later).
6.  Click **Create Web Service**.
    *   Wait for it to deploy.
    *   Once live, copy the **Backend URL** (e.g., `https://astrology-backend.onrender.com`).

---

## Step 4: Deploy User Frontend (Vercel)

1.  Log in to [Vercel](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    *   **Project Name**: `astrology-app` (or similar).
    *   **Framework Preset**: Vite (should auto-detect).
    *   **Root Directory**: Click `Edit` and select `frontend`. (⚠️ IMPORTANT)
5.  Open **Environment Variables** a
nd add:
    *   `VITE_API_BASE_URL`: `https://<YOUR-BACKEND-URL>/api`
        *   *Example*: `https://astrology-backend.onrender.com/api`
6.  Click **Deploy**.

---

## Step 5: Deploy Astrologer Portal (Vercel)

1.  Go back to [Vercel Dashboard](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import the **SAME** GitHub repository again.
4.  Configure the project:
    *   **Project Name**: `astrology-admin` (or similar).
    *   **Framework Preset**: Vite.
    *   **Root Directory**: Click `Edit` and select `astrologer`. (⚠️ IMPORTANT)
5.  Open **Environment Variables** and add:
    *   `VITE_API_BASE_URL`: `https://<YOUR-BACKEND-URL>/api`
6.  Click **Deploy**.

---

## 🎉 Done!

You now have three live URLs:
1.  **Backend API**: `https://astrology-backend.onrender.com`
2.  **User App**: `https://astrology-app.vercel.app`
3.  **Astrologer Portal**: `https://astrology-admin.vercel.app`


### ⚠️ Important Note on File Uploads
Since Render's free tier (and most serverless/cloud platforms) has an **ephemeral file system**, any files uploaded (profile pics, reports) will **disappear** when the server restarts or redeploys.

**✅ Solution Implemented: Cloudinary Integration**
I have already updated the backend to use **Cloudinary** for storing images (Astrologer profiles, Ganesha image, backgrounds, Palmistry images).

**You must add these Environment Variables to Render:**
1.  `CLOUDINARY_CLOUD_NAME`: Your Cloud Name
2.  `CLOUDINARY_API_KEY`: Your API Key
3.  `CLOUDINARY_API_SECRET`: Your API Secret

Get these by creating a free account at [Cloudinary.com](https://cloudinary.com).

