# Authentication Fix Checklist - Netlify Frontend + Render Backend

## Issue Description
Frontend on Netlify (https://kookiemoveon.netlify.app/) cannot authenticate with backend on Render (https://moveon.onrender.com), getting "Authentication required" error on protected endpoints.

## Root Cause
Cross-origin cookie handling between Netlify and Render requires specific configurations for cookies to be sent properly with requests.

## Fixes Applied

### 1. Backend Cookie Configuration (Fixed)
- Updated cookie settings in auth controller to conditionally set domain only in production
- Set `sameSite: 'none'` and `secure: true` only in production for cross-origin compatibility
- Used spread operator to conditionally include domain property

### 2. Backend CORS Configuration (Enhanced)
- Added debug logging to see blocked origins
- Ensured credentials: true is set to allow cookies to be sent cross-origin
- Confirmed frontend URL is in the allowed origins list

### 3. Frontend API Configuration (Confirmed)
- Verified `withCredentials: true` is set in axios instance
- Confirmed API calls will include cookies with requests

### 4. Authentication Middleware (Improved)
- Enhanced token extraction to handle both cookies and Bearer headers
- Added proper parsing for Bearer tokens

## Required Environment Variables on Render

Set these in your Render dashboard under Environment Variables:

```
NODE_ENV=production
JWT_SECRET=your-super-long-and-secure-jwt-secret-key-at-least-32-characters-here-replace-this-text
FRONTEND_URL=https://kookiemoveon.netlify.app/
RENDER_BACKEND_URL=https://moveon.onrender.com
DATABASE_URL=your-neon-postgresql-connection-string
```

## Verification Steps

1. Redeploy backend on Render with updated environment variables
2. Ensure frontend is using correct VITE_API_URL pointing to Render backend
3. Test login flow - cookies should now be stored properly
4. Test protected endpoints - cookies should be sent with requests
5. Check browser dev tools Network tab to verify cookies are included in requests
6. Monitor backend logs for any CORS-related errors

## Troubleshooting Tips

If issues persist:
1. Check browser dev tools > Application/Storage tab to see if the 'token' cookie is being stored
2. In Network tab, verify requests to protected endpoints include the cookie in headers
3. Check backend logs for CORS error messages
4. Temporarily add console.log statements to verify token extraction in middleware
5. Make sure both frontend and backend are using HTTPS in production

## Additional Security Notes

- The `sameSite: 'none'` setting requires `secure: true` to work in modern browsers
- Cookies with `httpOnly: true` cannot be accessed by JavaScript (good for XSS protection)
- The domain `.onrender.com` allows the cookie to be sent to any subdomain of onrender.com