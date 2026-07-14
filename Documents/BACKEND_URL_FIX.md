# Backend URL Fix

## Issue
The login was failing with `net::ERR_NAME_NOT_RESOLVED` because the application was trying to connect to `https://astrology-backend-dcfzeobdl-bhanuballias-projects.vercel.app`, which does not exist (DNS lookup failed).

## Fix
I have updated `astrologer/src/services/api.js` to use the standard, stable Vercel project URL format:
`https://astrology-backend-bhanuballias-projects.vercel.app/api`

This URL automatically points to the latest production deployment of your backend project.

## Required Action
To apply this fix:
1.  **Commit and Push** the changes in `astrologer/src/services/api.js` to your git repository.
2.  Wait for Vercel to redeploy the Astrologer Portal.
3.  Once deployed, the application will attempt to connect to the correct backend URL.

## Note
If you are still seeing connection errors (like 404 or Network Error) after this, ensure your backend project is actually named `astrology-backend` in Vercel and is currently deployed and running.
