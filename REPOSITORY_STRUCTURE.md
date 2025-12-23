# Panamerican Taekwondo Academy - Repository Structure

## Overview
This repository contains a full-stack web application for the Panamerican Taekwondo Academy, a martial arts training center in Winston-Salem, NC. The application includes a public-facing landing page with a real-time chat widget and a backend API for user authentication and admin functionality.

## Repository Structure

```
panamerican-tkd-academy/
├── .github/                    # GitHub-specific configurations
│   ├── copilot-instructions.md # GitHub Copilot workspace instructions
│   └── workflows/              # CI/CD workflows
│       └── backend-CI          # Backend continuous integration workflow
│
├── admin/                      # Admin dashboard
│   └── admin.html              # Administrative interface HTML
│
├── backend/                    # Node.js/Express backend server
│   ├── models/                 # Database models
│   │   └── User.js             # User model (Mongoose schema)
│   ├── routes/                 # API routes
│   │   ├── admin.js            # Admin-related endpoints
│   │   └── auth.js             # Authentication endpoints (local, Google, Apple OAuth)
│   ├── utils/                  # Utility functions
│   │   └── crypto.js           # Encryption/decryption utilities
│   ├── .env                    # Environment variables (not tracked in git)
│   ├── index.js                # Express server entry point
│   ├── package.json            # Backend dependencies
│   └── package-lock.json       # Locked dependency versions
│
├── full.png                    # Full academy logo (66KB)
├── icon.png                    # Academy icon (161KB)
├── index.html                  # Main landing page (~517 lines)
├── script.js                   # Client-side JavaScript (~239 lines)
├── styles.css                  # Main stylesheet (~1,572 lines)
└── LICENSE                     # MIT License
```

## Technology Stack

### Frontend
- **HTML5**: Semantic markup for the landing page
- **CSS3**: Custom styling with responsive design and animations
  - Belt divider visual elements (representing martial arts belt progression)
  - Responsive schedule tables
  - Chat widget styling
  - Particle effects and animations
- **Vanilla JavaScript**: Client-side interactivity
  - Socket.IO client for real-time chat
  - Form handling
  - Smooth scrolling and animations
  - Session management

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web application framework
- **MongoDB**: Database (via Mongoose ODM)
- **Socket.IO**: Real-time bidirectional communication
- **Authentication Stack**:
  - `passport`: Authentication middleware
  - `passport-local`: Local username/password authentication
  - `passport-google-oauth20`: Google OAuth 2.0
  - `passport-apple`: Apple Sign In
  - `jsonwebtoken`: JWT token generation
  - `bcrypt`: Password hashing
  - `express-session`: Session management
- **Security**:
  - Custom crypto utilities for data encryption
  - Environment variable management via `dotenv`

## Key Features

### Public Landing Page (`index.html`)
1. **Hero Section**: Eye-catching introduction with "Test Your Might!" tagline
2. **About Section**: Academy history, achievements (500+ students, 50+ medals, 20+ years)
3. **Programs Section**: Four main programs
   - Power Up (All ages - neurodivergent students)
   - Little Ninjas (Ages 5-9)
   - Dragons (Ages 10-17)
   - Core (Ages 17+)
4. **Class Schedule**: Responsive table showing weekly class times
5. **Testimonials**: Link to Google Reviews
6. **Contact Section**: Location, phone, hours, and trial class form
7. **Chat Widget**: Real-time communication feature with Socket.IO
8. **Visual Design Elements**:
   - Belt dividers representing progression (white → yellow → orange → green → blue → red → black)
   - Particle effects
   - Smooth scroll animations
   - Responsive mobile design

### Backend API (`backend/`)

#### Authentication Routes (`/auth`)
- `POST /auth/register`: Create new user account (local)
- `POST /auth/login`: User login (local, returns JWT)
- `GET /auth/google`: Initiate Google OAuth flow
- `GET /auth/google/callback`: Google OAuth callback
- `GET /auth/apple`: Initiate Apple Sign In
- `POST /auth/apple/callback`: Apple Sign In callback

#### Admin Routes (`/admin`)
- Administrative functionality (implementation in `admin.js`)

#### Security Features
- Email encryption in database
- Password hashing with bcrypt
- JWT-based authentication
- Session management

### Data Models

#### User Model
```javascript
{
  email: String (encrypted, unique, required)
  password: String (encrypted hash, required)
  isAdmin: Boolean (default: false)
}
```

## File Sizes
- **Total Lines of Code**: ~3,396 lines
- **Main Landing Page**: 517 lines (HTML)
- **Stylesheet**: 1,572 lines (CSS)
- **Client Script**: 239 lines (JavaScript)
- **Backend**: ~468 lines across all modules

## Configuration Files

### Backend Package.json
```json
{
  "name": "app_do_backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  }
}
```

### Dependencies
- express: ^4.18.2
- mongoose: (imported but not listed in package.json)
- socket.io: 4.5.4 (CDN)
- bcrypt: ^5.1.0
- jsonwebtoken: ^9.0.0
- passport family: ^0.6.0 - ^2.0.0
- dotenv: ^16.6.1

## Development Workflow

### Running the Application

#### Frontend
Simply open `index.html` in a web browser or serve via a static file server.

#### Backend
```bash
cd backend
npm install
node index.js
# Server runs on port 4000 by default
```

### Environment Variables
The backend requires a `.env` file with:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `PORT`: Server port (optional, defaults to 4000)

## Design Patterns

### Frontend Architecture
- **Component-based organization**: Chat widget, forms, sections
- **Event-driven**: DOM event listeners, Socket.IO events
- **Session management**: Visitor tracking via session IDs
- **Progressive enhancement**: Core functionality works without JavaScript

### Backend Architecture
- **MVC Pattern**: Models, Routes (Controllers), separate concerns
- **Middleware Stack**: Body parser → Session → Passport → Routes
- **Modular Routes**: Separate authentication and admin logic
- **Utility Layer**: Crypto functions abstracted

## Security Considerations

1. **Data Encryption**: User emails encrypted at rest
2. **Password Security**: bcrypt hashing with salt rounds
3. **Token-based Auth**: JWT with 1-hour expiration
4. **Environment Secrets**: Sensitive data in `.env` (gitignored)
5. **OAuth Integration**: Secure third-party authentication

## Visual Design Theme

The site uses a martial arts theme with:
- **Belt progression colors**: Visual representation through dividers (white → black belt)
- **Class color coding**: Different colors for different programs
- **Responsive design**: Mobile-first approach with breakpoints at 768px and 480px
- **Interactive elements**: Hover effects, animations, particle backgrounds
- **Professional imagery**: Academy logos and branding

## Contact Information
- **Location**: 3712 Reynolda Rd, Winston-Salem, NC
- **Phone**: (336) 624-8499
- **Email**: panamericantkd22@gmail.com
- **Hours**: Mon-Fri 4:00 PM - 8:00 PM, Sat 8:30 AM - 10:30 AM

## License
MIT License - Copyright (c) 2025 MartialArtsDevelopmentLab

---

*Last Updated: December 2025*
