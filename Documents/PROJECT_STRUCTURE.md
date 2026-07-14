# Project Structure

This document outlines the directory structure of the Astrology project.

## Main Directories

```
.
├── backend/                 # Backend server (Node.js/Express)
├── frontend/                # Main frontend application (React/Vite)
├── astrologer/              # Dedicated astrologer portal (React/Vite)
├── AI_CHATBOT_ENHANCEMENTS.md
├── CHATBOT_IMPROVEMENTS.md
├── CHATBOT_KNOWLEDGE_BASE_ISSUE.md
├── GEMINI_AI_INTEGRATION.md
├── GEMINI_API_SETUP.md
├── GEMINI_INTEGRATION_STATUS.md
├── INTERNET_SEARCH_FEATURE.md
├── NAVBAR_ENHANCEMENT_FEATURE.md
├── PERSONALIZED_WELCOME_FEATURE.md
├── VIDEO_CHAT_VALIDATION.md
├── ASTROLOGER_PORTAL_SETUP.md
└── PROJECT_STRUCTURE.md
```

## Backend (Node.js/Express)

The backend directory contains the main server application:

```
backend/
├── controllers/             # Request handlers
├── middleware/              # Authentication and other middleware
├── models/                  # Mongoose models
├── routes/                  # API route definitions
├── services/                # Background services (reminder scheduler)
├── cache/                   # Cached content files
└── server.js                # Main server entry point
```

## Frontend (Main Client Application)

The frontend directory contains the main client application:

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   ├── services/            # API service layer
│   ├── context/             # React context providers
│   ├── utils/               # Utility functions
│   ├── Admin/               # Admin-specific components
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
└── index.html               # HTML template
```

## Astrologer Portal

The astrologer directory contains a dedicated portal for astrologers:

```
astrologer/
├── src/
│   ├── components/          # Astrologer-specific components
│   │   ├── AstrologerLogin.jsx
│   │   └── AstrologerRegister.jsx
│   ├── pages/               # Astrologer page components
│   │   └── AstrologerDashboard.jsx
│   ├── services/            # Astrologer API service
│   │   └── api.js
│   ├── App.jsx              # Astrologer app component
│   └── main.jsx             # Entry point
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── postcss.config.js        # PostCSS configuration
```

## Key Features

### Backend Features
- RESTful API for appointments, kundali generation, and chatbot
- User authentication and role-based access control
- MongoDB integration with Mongoose
- Socket.io for real-time video chat
- Automated appointment reminders
- Content caching system

### Frontend Features
- User authentication (client login)
- Appointment booking system
- Kundali generation interface
- AI chatbot integration
- Video chat functionality
- UGC and N8N video sections
- Admin dashboard

### Astrologer Portal Features
- Dedicated login and registration for astrologers
- Appointment management dashboard
- Ability to confirm/cancel/complete appointments
- Leave messages for clients
- Profile management
- Statistics and analytics

## Development Setup

1. Backend: `cd backend && npm install`
2. Frontend: `cd frontend && npm install`
3. Astrologer Portal: `cd astrologer && npm install`

## Running the Applications

- Backend: `cd backend && npm start` (port 5000)
- Frontend: `cd frontend && npm run dev` (port 5173)
- Astrologer Portal: `cd astrologer && npm run dev` (port 3001)

In production, the astrologer portal is served by the backend server at `/astrologer/*` routes.