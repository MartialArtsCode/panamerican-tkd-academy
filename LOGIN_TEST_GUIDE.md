# Frontend Login Test Guide

## Current Status
✅ Backend Server: Running on port 3000
✅ Frontend Server: Running on port 8000
❌ MongoDB: Not running (will affect backend authentication)

## Test URLs
- **Frontend**: http://localhost:8000
- **Backend**: http://localhost:3000

## Login Test Credentials

### Default Admin Account (Pre-seeded)
- **Username**: `admin`
- **Email**: `admin@pta.local`
- **Password**: `admin123`
- **Role**: admin

## How to Test the Login

### Option 1: Test with Mock/Client-Side Login (No Backend Required)
The frontend has a built-in mock authentication system that stores user data in localStorage.

**Steps:**
1. Open http://localhost:8000 in your browser
2. Look for the "Login" button in the footer (with shield icon)
3. Click the Login button
4. Enter credentials:
   - **Email**: `admin@panamericantkd.com` (or any email)
   - **Password**: `admin123`
5. Click "Sign In"

**Note**: The mock system will redirect to `/admin/admin.html` after successful login.

### Option 2: Test with Backend API (Requires MongoDB)
To test the full authentication flow with the backend:

**Prerequisites:**
- MongoDB must be running on `localhost:27017`
- A test user must be registered first

**Steps to Register a User:**
```bash
# Using PowerShell or curl
Invoke-RestMethod -Uri "http://localhost:3000/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"test123"}'
```

**Steps to Login:**
1. Open http://localhost:8000
2. Click the "Login" button
3. Enter:
   - **Email**: `test@example.com`
   - **Password**: `test123`
4. Click "Sign In"

## Testing Checklist

- [ ] Can you see the Login button in the footer?
- [ ] Does clicking the Login button open a modal?
- [ ] Can you enter email and password?
- [ ] Does the form submit without JavaScript errors?
- [ ] Does it show appropriate error messages for invalid credentials?
- [ ] Does successful login redirect to admin page?
- [ ] Is the auth token stored in localStorage?

## Common Issues

### Issue: "Connection error" message
**Cause**: Backend server is not responding or MongoDB is not running
**Solution**: 
- Check if backend is running: http://localhost:3000
- Start MongoDB if using backend authentication

### Issue: Login button doesn't open modal
**Cause**: JavaScript not loaded or element ID mismatch
**Solution**: 
- Open browser DevTools (F12)
- Check Console for errors
- Verify that script.js is loaded

### Issue: "Invalid credentials" message
**Cause**: User doesn't exist in the system
**Solution**:
- For mock system: Use `admin@pta.local` / `admin123`
- For backend: Register user first using the API

## Inspect Login State

Open browser DevTools Console and run:
```javascript
// Check if user is logged in
localStorage.getItem('auth_token');
localStorage.getItem('user_email');
localStorage.getItem('pta_current_user_v1');

// Check stored users (mock system)
JSON.parse(localStorage.getItem('pta_users_v1'));
```

## Backend Health Check

Test if backend is responding:
```bash
Invoke-RestMethod -Uri "http://localhost:3000" -Method GET
```

Expected response: "Backend API is running" or similar message

## Next Steps After Successful Login

After successful login:
1. You should be redirected to `/admin/admin.html`
2. Check if auth token is stored: `localStorage.getItem('auth_token')`
3. The admin interface should load with your logged-in session

---

**Note**: This project has a hybrid authentication system:
- **Client-side (Mock)**: Uses localStorage for demonstration
- **Server-side (Production)**: Uses JWT tokens with MongoDB

For production use, ensure MongoDB is set up and use only the backend authentication.
