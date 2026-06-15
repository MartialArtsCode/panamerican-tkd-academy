# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
# Navigate to backend folder
cd backend

# Install Node.js packages
npm install
```

## Step 2: Setup MongoDB

### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod
```

### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` file with connection string

## Step 3: Configure Environment

Create `backend/.env`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/panamerican_tkd
JWT_SECRET=your_secret_key_change_this_in_production
NODE_ENV=development
```

## Step 4: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
✅ Server running on port 3000
✅ MongoDB connected
```

## Step 5: Start Frontend

In a new terminal, from the project root:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# Option 3: VS Code Live Server
# Right-click index.html → "Open with Live Server"
```

## Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:8000
```

## Step 7: Login

Use the default admin account:
```
Email: panamericantkd22@gmail.com
Password: admin123
```

## ✅ You're Ready!

Navigate through the app:
- 📱 **Feed** - Create posts, like, and comment
- 📅 **Events** - Create and RSVP to events
- 👥 **Members** - Browse member directory
- 💬 **Forum** - Start discussions
- ✉️ **Messages** - Real-time chat

## 🆘 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB service is running: `mongod --version`
- Verify connection string in `.env`
- Ensure port 27017 is not blocked

### Port Already in Use
```bash
# Backend (change PORT in .env)
PORT=3001

# Frontend (use different port)
python -m http.server 8001
```

### CORS Errors
- Ensure backend is running
- Check `CORS` configuration in `backend/index.js`
- Update `API_BASE` in `app.js` if needed

### JWT Errors
- Clear browser localStorage
- Check `JWT_SECRET` in `.env`
- Generate new token by logging in again

## 🎯 Next Steps

1. Create a new student account
2. Explore instructor tools (upgrade account tier)
3. Create events and posts
4. Customize branding in `config.js`
5. Deploy to production

## 📚 Need Help?

- Check [README.md](README.md) for full documentation
- View API docs in README
- Open an issue on GitHub
- Email: panamericantkd22@gmail.com
