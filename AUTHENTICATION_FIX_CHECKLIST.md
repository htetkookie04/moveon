# Authentication Fix Checklist - Netlify Frontend + Render Backend

## Issue Description
Frontend on Netlify (https://kookiemoveon.netlify.app/) cannot authenticate with backend on Render (https://moveon.onrender.com), getting "Authentication required" error on protected endpoints.

## Root Cause
Cross-origin requests from Netlify to Render: third-party cookies are often blocked by browsers, so cookie-based auth fails. **Solution: Use Bearer token in Authorization header** instead.

## Fixes Applied

### 1. Frontend - Bearer Token Auth (Primary Fix)
- Store JWT token in localStorage on login/register
- Axios request interceptor attaches `Authorization: Bearer <token>` to all requests
- Token cleared on logout and on 401 responses
- Works reliably cross-origin (no cookie restrictions)

### 2. Backend - Already Supports Bearer
- Auth middleware checks both `req.cookies.token` and `req.headers.authorization` (Bearer)
- No backend changes needed

### 3. DATABASE_URL Format
- Use raw connection string only: `postgresql://user:pass@host/db?sslmode=require`
- Do NOT include `psql` wrapper or extra quotes

## Required Environment Variables

### Render (Backend)
```
NODE_ENV=production
JWT_SECRET=your-super-long-and-secure-jwt-secret-key-at-least-32-characters
FRONTEND_URL=https://kookiemoveon.netlify.app
RENDER_BACKEND_URL=https://moveon.onrender.com
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### Netlify (Frontend)
Set **before** building (Site settings → Environment variables):
```
VITE_API_URL=https://moveon.onrender.com
```

## Verification Steps

1. Set `VITE_API_URL` in Netlify and redeploy frontend
2. Redeploy backend on Render with correct env vars
3. Login at https://kookiemoveon.netlify.app/login
4. Check Network tab: requests should have `Authorization: Bearer <token>` header
5. Protected routes (dashboard, entries) should work