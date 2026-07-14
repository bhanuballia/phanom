# Astrologer Portal Setup Guide

This document provides instructions for setting up and running the astrologer portal.

## Directory Structure

The astrologer portal is located in the `astrologer/` directory with the following structure:

```
astrologer/
├── src/
│   ├── components/
│   │   ├── AstrologerLogin.jsx
│   │   └── AstrologerRegister.jsx
│   ├── pages/
│   │   └── AstrologerDashboard.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Setup Instructions

1. Navigate to the astrologer directory:
   ```
   cd astrologer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. The astrologer portal will be available at:
   ```
   http://localhost:3001
   ```

## Building for Production

To build the astrologer portal for production:

```
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

The astrologer portal is configured to be served by the main backend server in production. The backend server (running on port 5000) will serve the astrologer portal files when accessed via `/astrologer/*` routes.

## API Integration

The astrologer portal communicates with the main backend API through the `/api` endpoint. During development, requests are proxied to `http://localhost:5000`.

## Authentication

Astrologers must have the role `astrologer` in the user database to access the portal. The login process verifies the user's credentials and role before granting access.

## Registration

New astrologers can register through the registration page which collects:
- Full name
- Email address
- Password (minimum 6 characters)
- Phone number
- Date of birth
- Time of birth
- Place of birth

All fields are required for registration.

## Features

The astrologer portal includes:

- Dedicated login and registration for astrologers
- Dashboard with appointment statistics
- Appointment management (view, confirm, cancel, complete)
- Ability to leave messages for clients
- Profile management

## Development

To modify the astrologer portal:

1. All frontend code is in the `astrologer/src/` directory
2. The main entry point is `astrologer/src/main.jsx`
3. Routes are defined in `astrologer/src/App.jsx`
4. API calls are handled by `astrologer/src/services/api.js`

## Backend Integration

The backend has dedicated routes for astrologer functionality:

- `/api/astrologer/profile` - Get/update astrologer profile
- `/api/astrologer/appointments` - Manage appointments
- `/api/astrologer/upcoming-appointments` - Get upcoming appointments

These routes are protected and require authentication.