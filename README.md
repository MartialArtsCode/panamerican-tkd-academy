# Panamerican Taekwondo Academy Website

A modern, professional website for Panamerican Taekwondo Academy featuring a comprehensive admin interface for managing visitor interactions, users, and content.

## Features

### Public Website
- 🥋 Responsive design optimized for all devices
- 📅 Interactive class schedule
- 💬 Real-time chat widget for visitor inquiries
- 📧 Contact form with email integration
- 🎨 Beautiful UI with Taekwondo-themed styling
- ⚡ Fast and lightweight

### Admin Interface
- 🔐 Secure authentication with JWT
- 💬 Real-time chat management with Socket.IO
- 👥 User management (create/delete users)
- 📊 View form submissions
- 📱 Responsive admin dashboard
- 🔔 Real-time notifications

## Project Structure

```
panamerican-tkd-academy/
├── admin/                  # Admin interface
│   ├── admin.html         # Admin dashboard page
│   ├── admin.css          # Admin styling
│   ├── admin.js           # Admin functionality
│   └── README.md          # Admin documentation
├── backend/               # Backend server
│   ├── index.js          # Main server file with Socket.IO
│   ├── create-admin.js   # Admin user creation script
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── package.json      # Backend dependencies
├── index.html            # Main website page
├── script.js             # Website JavaScript
├── styles.css            # Website styling
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MartialArtsCode/panamerican-tkd-academy.git
   cd panamerican-tkd-academy
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```env
   ENCRYPTION_KEY=Q!Q@W!W@E!E@R!R@T!T@Y!Y@U!U@I!I@A!A@S!S@D!D@F!F@
   MONGO_URI=mongodb://localhost:27017/app_do
   JWT_SECRET=your_jwt_secret_key_here
   PORT=4000
   SOCKET_PORT=3000
   ```

4. Start MongoDB (if running locally):
   ```bash
   mongod --dbpath /path/to/data
   ```

5. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
   
   This will start:
   - Express API server on port 4000
   - Socket.IO server on port 3000

6. Open the website:
   - Main site: `http://localhost:3000/index.html`
   - Admin panel: `http://localhost:3000/admin/admin.html`

### Creating an Admin User

To create your first admin user:

```bash
cd backend
node create-admin.js admin@example.com yourpassword
```

This will create an admin account that you can use to log in to the admin panel.

## Usage

### Public Website

The main website is accessible at the root URL. Visitors can:
- View class schedules
- Learn about programs
- Contact the academy via form or chat
- Schedule a free trial class

### Admin Panel

Access the admin panel at `/admin/admin.html`:

1. **Login**: Use your admin credentials
2. **Live Chat**: Monitor and respond to visitor messages in real-time
3. **User Management**: Create or remove users
4. **Messages**: View form submissions

For detailed admin documentation, see [admin/README.md](admin/README.md)

## Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome icons
- Socket.IO client
- Responsive design

### Backend
- Node.js with Express
- Socket.IO for real-time communication
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Custom encryption for sensitive data

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/app_do` |
| `JWT_SECRET` | Secret key for JWT tokens | `secret` |
| `ENCRYPTION_KEY` | 32-character key for data encryption | Required |
| `PORT` | Express API server port | `4000` |
| `SOCKET_PORT` | Socket.IO server port | `3000` |

### Ports

- **3000**: Socket.IO server (WebSocket connections)
- **4000**: Express API server (HTTP endpoints)

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/google` - Google OAuth
- `GET /auth/apple` - Apple OAuth

### Admin (requires authentication)
- `POST /admin/create-user` - Create new user
- `DELETE /admin/remove-user` - Remove user

## Security

- Passwords are hashed using bcrypt
- Sensitive data encrypted with AES-256-CBC
- JWT tokens for session management
- CORS enabled for API security
- Input validation and sanitization

## Development

### Running in Development

```bash
# Start the backend with auto-reload
cd backend
npm install -g nodemon
nodemon index.js
```

### Testing the Chat

1. Open the main website in one browser tab
2. Open the admin panel in another tab
3. Send a message from the main website
4. See it appear in the admin panel in real-time

## Deployment

### Heroku Deployment

1. Create a new Heroku app
2. Add MongoDB Atlas add-on or use external MongoDB
3. Set environment variables in Heroku
4. Deploy:
   ```bash
   git push heroku main
   ```

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `MONGO_URI` (use MongoDB Atlas)
- `JWT_SECRET` (generate a strong random string)
- `ENCRYPTION_KEY` (32 characters)
- `NODE_ENV=production`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Panamerican Taekwondo Academy
- Location: 3712 Reynolda Rd, Winston-Salem, NC
- Phone: (336) 624-8499
- Facebook: [Panamericantaekwondoacademy1](https://www.facebook.com/Panamericantaekwondoacademy1/)

## Acknowledgments

- Built with ❤️ for martial arts education
- Socket.IO for real-time communication
- MongoDB for flexible data storage
- Font Awesome for beautiful icons
