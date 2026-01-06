# 🚀 Deployment Guide

## Backend Deployment (Render.com)

### Step 1: Prepare Backend for Deployment

1. Ensure your `backend/package.json` has a start script:
```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

2. Create `backend/.gitignore` if not exists:
```
node_modules/
.env
data/
exports/
*.log
```

### Step 2: Deploy to Render

1. **Sign up** at [render.com](https://render.com)

2. **Create New Web Service**
   - Connect your GitHub repository
   - Select the `backend` directory as root directory
   - Or use manual deploy

3. **Configure Service**
   - Name: `panamerican-tkd-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free` (or paid for production)

4. **Add Environment Variables**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/panamerican_tkd
   JWT_SECRET=your_super_secure_secret_key_minimum_32_characters
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy** - Click "Create Web Service"

6. **Get Backend URL** - e.g., `https://panamerican-tkd-backend.onrender.com`

### Step 3: Setup MongoDB Atlas

1. **Create Account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**
   - Choose FREE tier (M0)
   - Select closest region
   - Name: `panamerican-tkd`

3. **Create Database User**
   - Database Access → Add New User
   - Username & Password (save these!)
   - Grant read/write access

4. **Whitelist IP Address**
   - Network Access → Add IP Address
   - Allow Access from Anywhere: `0.0.0.0/0`
   - (For production, use specific IPs)

5. **Get Connection String**
   - Clusters → Connect → Connect Your Application
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `panamerican_tkd`

6. **Add to Render Environment Variables**
   - Update `MONGO_URI` in Render dashboard

---

## Frontend Deployment (GitHub Pages)

### Step 1: Update API Configuration

Edit `app.js` line 2:
```javascript
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://your-backend-url.onrender.com/api';  // ← Update this
```

Replace with your actual Render backend URL.

### Step 2: Deploy to GitHub Pages

#### Option A: GitHub Actions (Recommended)

1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          exclude_assets: 'backend/**,node_modules/**,.git/**'
```

2. **Enable GitHub Pages**
   - Repo Settings → Pages
   - Source: `gh-pages` branch
   - Save

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

#### Option B: Manual Deployment

1. **Enable GitHub Pages**
   - Repo Settings → Pages
   - Source: `main` branch / `root`
   - Save

2. Your site will be at:
   ```
   https://MartialArtsCode.github.io/panamerican-tkd-academy/
   ```

---

## Alternative: Netlify Deployment

### Step 1: Prepare for Netlify

1. Create `netlify.toml` in project root:
```toml
[build]
  publish = "."
  command = "echo 'Static site - no build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Update `app.js` with backend URL

### Step 2: Deploy

1. **Sign up** at [netlify.com](https://www.netlify.com)

2. **Deploy Site**
   - New Site from Git
   - Connect GitHub repo
   - Deploy settings:
     - Build command: (leave empty)
     - Publish directory: `.`

3. **Configure Domain** (optional)
   - Domain Settings → Add custom domain
   - Or use provided `*.netlify.app` URL

---

## Alternative: Vercel Deployment

### Step 1: Prepare for Vercel

1. Create `vercel.json` in project root:
```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

2. Update `app.js` with backend URL

### Step 2: Deploy

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts** to link project and deploy

---

## Post-Deployment Checklist

### Backend
- ✅ Server is running (check Render logs)
- ✅ MongoDB connection successful
- ✅ Environment variables set correctly
- ✅ CORS allows frontend domain
- ✅ Health check endpoint working: `GET /api/health`
- ✅ Test login endpoint: `POST /api/auth/login`

### Frontend
- ✅ Site loads correctly
- ✅ API_BASE points to correct backend URL
- ✅ Login page works
- ✅ Can create account
- ✅ Navigation works
- ✅ Images and assets load
- ✅ HTTPS enabled (automatic on most hosts)

### Testing
```bash
# Test backend health
curl https://your-backend.onrender.com/api/health

# Test login
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## Update CORS Settings

After deployment, update `backend/index.js` CORS configuration:

```javascript
const corsOptions = {
    origin: [
        'https://martialartscode.github.io',
        'https://your-custom-domain.com',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
```

Redeploy backend after updating CORS.

---

## Monitoring & Maintenance

### Render Dashboard
- Monitor logs for errors
- Check uptime and response times
- View deployed commits
- Restart service if needed

### MongoDB Atlas
- Monitor database size
- Check connection count
- View slow queries
- Set up automated backups

### GitHub/Netlify/Vercel
- Monitor build logs
- Check deployment status
- Configure custom domains
- Set up SSL certificates (automatic)

---

## Custom Domain Setup

### For Backend (Render)
1. Buy domain (e.g., Namecheap, GoDaddy)
2. Render Settings → Custom Domain
3. Add domain: `api.yourdomain.com`
4. Update DNS records as instructed

### For Frontend (GitHub Pages/Netlify)
1. Repository Settings → Pages → Custom Domain
2. Add domain: `www.yourdomain.com`
3. Update DNS CNAME record
4. Enable HTTPS (automatic)

---

## Troubleshooting

### Backend Not Starting
- Check Render logs for errors
- Verify environment variables
- Ensure MongoDB connection string is correct
- Check `package.json` start script

### CORS Errors
- Add frontend URL to CORS whitelist
- Redeploy backend
- Clear browser cache
- Check if using HTTPS/HTTP correctly

### MongoDB Connection Failed
- Check Atlas IP whitelist
- Verify connection string
- Ensure database user exists
- Check Atlas cluster status

### Frontend Can't Reach Backend
- Verify `API_BASE` URL in `app.js`
- Check if backend is running (visit health endpoint)
- Verify CORS settings
- Check browser console for errors

---

## Production Optimization

### Backend
- Set `NODE_ENV=production`
- Enable compression middleware
- Add request logging
- Set up monitoring (e.g., Sentry)
- Configure rate limiting
- Set up automated backups

### Frontend
- Minify JavaScript/CSS
- Optimize images
- Enable caching headers
- Add CDN for assets
- Implement lazy loading
- Add service worker for offline support

### Database
- Create indexes on frequently queried fields
- Set up automated backups
- Monitor slow queries
- Optimize large collections
- Consider read replicas for scale

---

## Costs (Free Tier)

### Free Hosting Options
- **Render:** Free tier available (sleeps after inactivity)
- **MongoDB Atlas:** 512MB free forever
- **GitHub Pages:** Free for public repos
- **Netlify:** 100GB bandwidth/month free
- **Vercel:** Free for personal projects

### Paid Upgrades (Production)
- **Render:** $7/month for always-on
- **MongoDB Atlas:** $9/month for 2GB
- **Custom Domain:** $10-15/year
- **SSL Certificate:** Free (Let's Encrypt)

---

## Support

Having deployment issues?
- Check Render/Netlify/Vercel documentation
- Review application logs
- Open GitHub issue
- Email: panamericantkd22@gmail.com

---

**Deployment Status:** Ready for production! 🚀
