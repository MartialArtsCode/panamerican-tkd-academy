# 🔐 MongoDB Atlas Setup Instructions

## Your MongoDB Connection Details

**Cluster:** `cluster0.jvkujmu.mongodb.net`  
**Username:** `panamericantkd22_db_user`  
**Database:** `panamerican_tkd` (recommended)

## Step 1: Get Your Password

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in with your account
3. Go to **Database Access** → Find user `panamericantkd22_db_user`
4. If you forgot the password, click **Edit** → **Edit Password** → Set new password
5. **Copy the password** (you'll need it for Step 3)

## Step 2: Whitelist Your IP Address

1. In MongoDB Atlas, go to **Network Access**
2. Click **Add IP Address**
3. For development: Click **Allow Access from Anywhere** (0.0.0.0/0)
4. For production: Add your specific server IP address
5. Click **Confirm**

## Step 3: Create .env File

Create a file named `.env` in the `backend` folder with this content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Atlas Connection
# Replace <YOUR_PASSWORD> with the actual password from Step 1
MONGO_URI=mongodb+srv://panamericantkd22_db_user:<YOUR_PASSWORD>@cluster0.jvkujmu.mongodb.net/panamerican_tkd?retryWrites=true&w=majority

# JWT Secret (keep this secure!)
JWT_SECRET=panamerican_tkd_super_secure_jwt_secret_key_2026_change_in_production

# CORS Origins
CORS_ORIGIN=https://martialartscode.github.io,http://localhost:8000,http://127.0.0.1:8000
```

**⚠️ IMPORTANT:** Replace `<YOUR_PASSWORD>` with your actual database password!

## Step 4: Test Connection

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not done)
npm install

# Start the server
npm start
```

You should see:
```
✅ MongoDB Connected: cluster0.jvkujmu.mongodb.net
📊 Database: panamerican_tkd
✅ Server running on port 3000
```

## Step 5: Connect via MongoDB Shell (Optional)

To connect directly using mongosh:

```bash
mongosh "mongodb+srv://cluster0.jvkujmu.mongodb.net/panamerican_tkd" --username panamericantkd22_db_user
```

Enter your password when prompted.

## Troubleshooting

### ❌ Authentication Failed
- Double-check your password
- Ensure no extra spaces in .env file
- Password may need URL encoding if it contains special characters

### ❌ Connection Timeout
- Check Network Access in MongoDB Atlas
- Ensure your IP is whitelisted (0.0.0.0/0 for development)
- Check your internet connection

### ❌ MongoServerError: bad auth
- Verify username is exactly: `panamericantkd22_db_user`
- Reset password in MongoDB Atlas
- Ensure user has read/write permissions

### ❌ ENOTFOUND cluster0.jvkujmu.mongodb.net
- Check internet connection
- Verify cluster address is correct
- DNS issues - try again in a few minutes

## Production Deployment

When deploying to Render/Heroku/etc:

1. **Do NOT commit .env file** (it's in .gitignore)
2. Add environment variables in hosting platform dashboard:
   - `MONGO_URI` = `mongodb+srv://panamericantkd22_db_user:<password>@cluster0.jvkujmu.mongodb.net/panamerican_tkd?retryWrites=true&w=majority`
   - `JWT_SECRET` = (generate a secure random string)
   - `NODE_ENV` = `production`

3. **Whitelist Production IP:**
   - In MongoDB Atlas → Network Access
   - Add your server's IP address (get from hosting provider)

## Security Best Practices

✅ **DO:**
- Use strong, unique passwords
- Rotate JWT secret regularly
- Whitelist specific IPs in production
- Enable MongoDB Atlas monitoring
- Set up automated backups

❌ **DON'T:**
- Commit .env file to Git
- Share your password publicly
- Use weak passwords
- Leave 0.0.0.0/0 open in production
- Ignore security alerts

## MongoDB Atlas Features to Enable

1. **Database → Collections** - View/manage your data
2. **Monitoring** - Track database performance
3. **Backups** - Enable automated backups (recommended)
4. **Alerts** - Set up email alerts for issues
5. **Profiler** - Identify slow queries

## Next Steps

Once connected:
1. ✅ Verify backend starts without errors
2. ✅ Test API endpoints (GET /api/health)
3. ✅ Try logging in from frontend
4. ✅ Create a test post
5. ✅ Check MongoDB Atlas → Collections to see data

## Support

Issues connecting?
- Check MongoDB Atlas status: https://status.mongodb.com/
- Review MongoDB docs: https://docs.mongodb.com/
- Email: panamericantkd22@gmail.com

---

**Status:** Ready to connect to MongoDB Atlas! 🚀
