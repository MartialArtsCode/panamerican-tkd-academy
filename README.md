# 🥋 Panamerican Taekwondo Academy - Full Stack Application

A comprehensive social platform for managing a taekwondo academy with real-time messaging, event management, member tracking, forums, and more.

## ✨ Features

### 📱 **Core Features**
- **Social Feed** - Share posts, announcements, photos, videos with likes and comments
- **Event Management** - Create and RSVP to tournaments, belt tests, seminars, and social events
- **Member Directory** - Browse members, view profiles, track belt progress and achievements
- **Forum** - Community discussions organized by categories with threading
- **Real-time Messaging** - Live chat system for members and administrators
- **Notifications** - Stay updated with real-time notifications for all activities

### 👨‍🏫 **Instructor Tools**
- **Attendance Tracking** - Record and monitor student attendance
- **Class Scheduling** - Create and manage class schedules
- **Training Modules** - Assign technique videos and training materials to students
- **Student Progress** - Track belt advancements and achievements
- **Feedback System** - Provide structured feedback to students

### 🏆 **Gamification**
- **Achievements System** - Award badges for milestones (tournaments, training, community participation)
- **Belt Progress Tracker** - Visual progress tracking for belt requirements
- **Leaderboards** - Track attendance, achievements, and participation

### 🔐 **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Student, Instructor, Master)
- Secure password hashing
- Session management

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **MongoDB** + **Mongoose** - Database and ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing

### Frontend
- **Vanilla JavaScript** - Modern ES6+ features
- **HTML5** + **CSS3** - Semantic markup and responsive design
- **Socket.IO Client** - Real-time updates
- **Fetch API** - HTTP requests

## 📁 Project Structure

```
panamerican_taekwondo_academy/
├── backend/
│   ├── index.js                 # Main server file
│   ├── config/
│   │   ├── db.js               # MongoDB configuration
│   │   ├── jwt.js              # JWT utilities
│   │   └── mail.js             # Email service
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Post.js             # Social feed posts
│   │   ├── Comment.js          # Post comments
│   │   ├── Event.js            # Events schema
│   │   ├── ForumThread.js      # Forum threads
│   │   ├── ForumReply.js       # Forum replies
│   │   ├── Achievement.js      # User achievements
│   │   ├── Attendance.js       # Class attendance
│   │   ├── Class.js            # Class schedules
│   │   ├── TrainingModule.js   # Training materials
│   │   ├── Notification.js     # User notifications
│   │   ├── Message.js          # Chat messages
│   │   └── Session.js          # Chat sessions
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── feed.js             # Social feed API
│   │   ├── events.js           # Events API
│   │   ├── forum.js            # Forum API
│   │   ├── members.js          # Members API
│   │   ├── classes.js          # Classes & training API
│   │   ├── notifications.js    # Notifications API
│   │   ├── admin.js            # Admin operations
│   │   └── health.js           # Health checks
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification
│   │   ├── rateLimit.js        # Rate limiting
│   │   └── socketAuth.js       # Socket authentication
│   ├── sockets/
│   │   ├── index.js            # Socket.IO setup
│   │   ├── visitor.socket.js   # Visitor chat handlers
│   │   └── admin.socket.js     # Admin chat handlers
│   └── services/
│       ├── ai.service.js       # AI integration
│       ├── analytics.service.js # Analytics tracking
│       ├── export.service.js   # Data export
│       └── notify.service.js   # Notification service
├── pages/
│   ├── feed.html               # Social feed page
│   ├── feed.js                 # Feed logic
│   ├── events.html             # Events calendar
│   ├── events.js               # Events logic
│   ├── forum.html              # Discussion forum
│   ├── members.html            # Member directory
│   ├── messages.html           # Real-time chat
│   ├── profile.html            # User profile
│   └── pages.css               # Shared page styles
├── admin/
│   ├── admin.html              # Admin dashboard
│   ├── admin.js                # Admin logic
│   └── admin.css               # Admin styles
├── instructor/
│   ├── index.html              # Instructor tools
│   ├── instructor.js           # Instructor logic
│   └── instructor.css          # Instructor styles
├── member/
│   ├── member.html             # Member portal
│   ├── member.js               # Member logic
│   └── member.css              # Member styles
├── docs/
│   ├── index.html              # Documentation hub
│   ├── pages/                  # Page documentation
│   ├── components/             # Component specs
│   └── entities/               # Data model schemas
├── index.html                  # Landing page
├── app.js                      # Core app utilities
├── script.js                   # Main app logic
├── styles.css                  # Global styles
└── config.js                   # Frontend config
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MartialArtsCode/panamerican-tkd-academy.git
   cd panamerican-tkd-academy
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/panamerican_tkd
   JWT_SECRET=your_super_secret_key_change_this
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Windows
   mongod

   # macOS/Linux
   sudo mongod
   ```

5. **Start the backend server**
   ```bash
   npm start
   ```

6. **Serve the frontend**
   ```bash
   # In the root directory
   # Option 1: Using Python
   python -m http.server 8000

   # Option 2: Using Node.js http-server
   npx http-server -p 8000

   # Option 3: Using VS Code Live Server extension
   ```

7. **Open the application**
   Navigate to `http://localhost:8000` in your browser

### Default Admin Account
```
Email: placeYourEmail@here.com
Password: createYourPass
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "tier": "student",
  "belt": "white"
}
```

#### POST `/api/auth/login`
Authenticate user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current user profile (requires JWT token)

### Feed Endpoints

#### GET `/api/feed?page=1&limit=20`
Get paginated feed posts

#### POST `/api/feed`
Create a new post
```json
{
  "content": "Great training session today!",
  "image_url": "https://example.com/image.jpg"
}
```

#### POST `/api/feed/:postId/like`
Like/unlike a post

#### GET `/api/feed/:postId/comments`
Get comments for a post

#### POST `/api/feed/:postId/comments`
Add a comment to a post

### Events Endpoints

#### GET `/api/events?type=tournament&upcoming=true`
Get events (filtered by type and date)

#### POST `/api/events`
Create an event (instructors only)

#### POST `/api/events/:eventId/rsvp`
RSVP to an event

### Forum Endpoints

#### GET `/api/forum/threads?category=techniques&page=1`
Get forum threads

#### POST `/api/forum/threads`
Create a new thread

#### GET `/api/forum/threads/:threadId/replies`
Get replies for a thread

#### POST `/api/forum/threads/:threadId/replies`
Add a reply to a thread

### Members Endpoints

#### GET `/api/members?tier=student&belt=blue`
Get filtered member list

#### GET `/api/members/:email`
Get member profile with achievements and attendance

#### PUT `/api/members/:email`
Update member profile

### Classes Endpoints

#### GET `/api/classes`
Get all active classes

#### POST `/api/classes/:classId/attendance`
Record attendance (instructors only)

#### GET `/api/classes/training-modules?belt_level=blue`
Get training modules

## 🎨 Customization

### Branding
Update the following files to customize branding:
- `config.js` - App configuration
- `styles.css` - Color scheme and typography
- `index.html` - Landing page content

### Adding New Features
1. Create model in `backend/models/`
2. Create route handlers in `backend/routes/`
3. Add API calls in `app.js`
4. Create frontend page in `pages/`

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- XSS protection
- SQL injection prevention (using Mongoose)

## 🧪 Testing

```bash
cd backend
npm test
```

## 📦 Deployment

### Backend Deployment (Render/Heroku)
1. Set environment variables in your hosting platform
2. Update `MONGO_URI` to your cloud MongoDB (MongoDB Atlas)
3. Deploy from GitHub repository

### Frontend Deployment (GitHub Pages/Netlify)
1. Update `API_BASE` in `app.js` with your backend URL
2. Deploy static files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **MartialArtsCode** - Initial work - [GitHub](https://github.com/MartialArtsCode)

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- MongoDB for flexible data storage
- Express.js community
- All contributors and testers

## 📞 Support

For support, email panamericantkd22@gmail.com or open an issue on GitHub.

---

Made with ❤️ for the Panamerican Taekwondo Academy community

