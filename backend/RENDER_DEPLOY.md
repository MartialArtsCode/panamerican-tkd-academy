# Render Deployment Guide for PTA Backend

## Quick Deploy to Render.com

### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub (recommended)

### 2. Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `MartialArtsCode/panamerican-tkd-academy`
3. Configure:
   - **Name**: `pta-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3. Add Environment Variables
Click "Environment" tab and add:
```
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_12345
MONGO_URI=mongodb://127.0.0.1:27017/pta_chat
NODE_ENV=production
```

**⚠️ Important**: Change `JWT_SECRET` to a strong random string!

### 4. Deploy
- Click "Create Web Service"
- Wait 5-10 minutes for first deployment
- You'll get a URL like: `https://pta-backend.onrender.com`

### 5. Update Frontend Config
In `config.js`, change line 6:
```javascript
const PRODUCTION_API_URL = 'https://pta-backend.onrender.com';
```

### 6. Test Backend
Visit: `https://your-app.onrender.com/api/health`
Should return: `{"status":"ok"}`

### Notes
- Free tier sleeps after 15 min of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid ($7/month) for always-on

### Troubleshooting
- Check "Logs" tab in Render dashboard
- Verify all environment variables are set
- Ensure ROOT_DIRECTORY is set to `backend`
