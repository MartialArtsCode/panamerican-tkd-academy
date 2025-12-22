# Admin Interface Documentation

## Overview

The Admin Interface provides a comprehensive dashboard for managing the Panamerican TKD Academy website, including:
- Real-time chat management with visitors
- User management (create/delete users)
- View form submissions
- Monitor active sessions

## Accessing the Admin Interface

The admin interface is accessible at: `http://your-domain.com/admin/admin.html`

For local development: `http://localhost:3000/admin/admin.html`

## Features

### 1. Authentication
- Secure login with email and password
- JWT token-based authentication
- Session persistence using localStorage

### 2. Live Chat Management
- View all active visitor sessions
- Real-time message notifications
- Reply to visitor messages instantly
- Socket.IO powered real-time communication
- Message history for each session

### 3. User Management
- Create new admin/user accounts
- Remove existing users
- View user roles (Admin/User)

### 4. Form Submissions
- View all form submissions from the main website
- Track trial class requests
- Monitor contact inquiries

## Prerequisites

Before using the admin interface, ensure:

1. **Backend Server is Running**
   ```bash
   cd backend
   npm install
   node index.js
   ```
   This starts:
   - Express API server on port 4000
   - Socket.IO server on port 3000

2. **MongoDB is Running**
   ```bash
   # Start MongoDB service
   mongod --dbpath /path/to/data
   ```
   Or use MongoDB Atlas cloud service

3. **Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```env
   ENCRYPTION_KEY=your_32_character_encryption_key
   MONGO_URI=mongodb://localhost:27017/app_do
   JWT_SECRET=your_jwt_secret
   PORT=4000
   SOCKET_PORT=3000
   ```

## Creating the First Admin User

To create an admin user, you can either:

### Option 1: Using the Registration Endpoint (Temporary)
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_secure_password"
  }'
```

Then manually update the user in MongoDB to set `isAdmin: true`:
```javascript
db.users.updateOne(
  { email: "encrypted_email" },
  { $set: { isAdmin: true } }
)
```

### Option 2: Direct Database Insert
Use MongoDB shell or a database client to insert an admin user directly:
```javascript
// Note: You'll need to encrypt the email and password first
// using the backend's crypto utilities
```

## Usage Guide

### Logging In
1. Navigate to `/admin/admin.html`
2. Enter your admin email and password
3. Click "Login"
4. Upon successful authentication, you'll see the admin dashboard

### Managing Live Chat
1. Click on the "Live Chat" tab (default view)
2. Active visitor sessions appear in the left sidebar
3. Click on a session to view the conversation
4. Type your response in the input field and click "Send"
5. Messages are delivered in real-time via Socket.IO

### Managing Users
1. Click on the "User Management" tab
2. Click "Add User" to create a new user
3. Enter email and password
4. Click "Create User"
5. To delete a user, click the delete button next to their entry

### Viewing Messages
1. Click on the "Messages" tab
2. View all form submissions from the website
3. Click "Refresh" to update the list

## Security Notes

- Always use strong passwords for admin accounts
- Keep the JWT_SECRET and ENCRYPTION_KEY secure
- Never commit `.env` files to version control
- Use HTTPS in production
- Regularly update dependencies for security patches

## Troubleshooting

### Cannot Connect to Server
- Ensure the backend server is running on the correct ports
- Check that MongoDB is accessible
- Verify firewall settings allow connections to ports 3000 and 4000

### Login Fails
- Verify the email and password are correct
- Check that the user has `isAdmin: true` in the database
- Ensure JWT_SECRET matches between backend and stored token

### Chat Messages Not Appearing
- Verify Socket.IO connection in browser console
- Check that both admin and visitor are connected to the same Socket.IO server
- Ensure no firewall blocking WebSocket connections

## Development

The admin interface consists of three main files:
- `admin.html` - Structure and layout
- `admin.css` - Styling and responsive design
- `admin.js` - Functionality and Socket.IO integration

To modify the interface:
1. Edit the respective files
2. Refresh the browser to see changes
3. No build step required for basic changes

## API Endpoints Used

- `POST /auth/login` - Authenticate admin user
- `POST /admin/create-user` - Create new user (requires admin token)
- `DELETE /admin/remove-user` - Remove user (requires admin token)

## Browser Support

The admin interface supports modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Potential improvements:
- Email notifications for new messages
- Analytics dashboard
- Export chat transcripts
- Bulk user management
- Advanced filtering and search
- Mobile app version
