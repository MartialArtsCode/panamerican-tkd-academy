# Panamerican TKD Academy - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          LANDING PAGE (index.html)                        │  │
│  │  • Hero Section                                           │  │
│  │  • Programs (Power Up, Little Ninjas, Dragons, Core)     │  │
│  │  • Schedule                                               │  │
│  │  • Contact Form                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         CLIENT-SIDE SCRIPTS (script.js)                   │  │
│  │  • Socket.IO Client                                       │  │
│  │  • Chat Widget Logic                                      │  │
│  │  • Form Handling                                          │  │
│  │  • Animations & Effects                                   │  │
│  │  • Session Management                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           STYLES (styles.css)                             │  │
│  │  • Responsive Design                                      │  │
│  │  • Belt Divider Animations                                │  │
│  │  • Chat Widget Styling                                    │  │
│  │  • Mobile-First Approach                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                   HTTP/WS Connection
                           │
┌──────────────────────────┴───────────────────────────────────────┐
│                    APPLICATION LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         EXPRESS SERVER (backend/index.js)                 │   │
│  │  • Port: 4000                                             │   │
│  │  • Body Parser Middleware                                 │   │
│  │  • Session Management                                     │   │
│  │  • Passport.js Integration                                │   │
│  │  • Socket.IO Server                                       │   │
│  └──────────────┬───────────────────────────┬────────────────┘   │
│                 │                           │                    │
│    ┌────────────┴─────────┐    ┌───────────┴─────────────┐      │
│    │   AUTH ROUTES        │    │   ADMIN ROUTES          │      │
│    │  (/auth)             │    │   (/admin)              │      │
│    │                      │    │                         │      │
│    │ • POST /register     │    │ • Admin Dashboard       │      │
│    │ • POST /login        │    │ • User Management       │      │
│    │ • GET /google        │    │ • (Protected)           │      │
│    │ • GET /apple         │    │                         │      │
│    └──────────────────────┘    └─────────────────────────┘      │
│                                                                   │
└─────────────────────┬─────────────────────────────────────────────┘
                      │
              Database Queries
                      │
┌─────────────────────┴─────────────────────────────────────────────┐
│                     DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           MONGODB DATABASE                                │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │  USERS COLLECTION                                │     │   │
│  │  │  • email (encrypted)                             │     │   │
│  │  │  • password (encrypted + hashed)                 │     │   │
│  │  │  • isAdmin (boolean)                             │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘


## Authentication Flow

┌─────────┐                                              ┌──────────┐
│ Client  │                                              │  Server  │
└────┬────┘                                              └────┬─────┘
     │                                                        │
     │  1. POST /auth/register {email, password}             │
     │───────────────────────────────────────────────────────>│
     │                                                        │
     │                2. Hash password with bcrypt           │
     │                3. Encrypt email & password            │
     │                4. Save to MongoDB                     │
     │                                                        │
     │<───────────────────────────────────────────────────────│
     │  5. {message: "User registered"}                      │
     │                                                        │
     │  6. POST /auth/login {email, password}                │
     │───────────────────────────────────────────────────────>│
     │                                                        │
     │                7. Find user by encrypted email        │
     │                8. Compare password with bcrypt        │
     │                9. Generate JWT token                  │
     │                                                        │
     │<───────────────────────────────────────────────────────│
     │  10. {token: "jwt_token_here"}                        │
     │                                                        │
     │  11. Subsequent requests with JWT in header           │
     │───────────────────────────────────────────────────────>│
     │                                                        │
     │                12. Verify JWT                         │
     │                13. Process request                    │
     │                                                        │
     │<───────────────────────────────────────────────────────│
     │  14. Response data                                    │
     │                                                        │


## OAuth Flow (Google/Apple)

┌─────────┐              ┌──────────┐              ┌────────────────┐
│ Client  │              │  Server  │              │ OAuth Provider │
└────┬────┘              └────┬─────┘              └───────┬────────┘
     │                        │                            │
     │  1. GET /auth/google   │                            │
     │───────────────────────>│                            │
     │                        │  2. Redirect to Google     │
     │<───────────────────────│                            │
     │                        │                            │
     │  3. User authorizes on Google                       │
     │─────────────────────────────────────────────────────>│
     │                        │                            │
     │  4. Redirect to /auth/google/callback               │
     │<─────────────────────────────────────────────────────│
     │───────────────────────>│                            │
     │                        │  5. Exchange code for      │
     │                        │     user profile           │
     │                        │───────────────────────────>│
     │                        │<───────────────────────────│
     │                        │  6. User profile data      │
     │                        │                            │
     │                        │  7. Save/update user       │
     │                        │     in MongoDB             │
     │                        │  8. Generate JWT           │
     │<───────────────────────│                            │
     │  9. {token: "jwt"}     │                            │
     │                        │                            │


## Real-time Chat Flow (Socket.IO)

┌─────────┐                                              ┌──────────┐
│ Visitor │                                              │  Admin   │
└────┬────┘                                              └────┬─────┘
     │                                                        │
     │  1. Connect to Socket.IO                              │
     │  2. Emit 'visitor-connect' with sessionId             │
     │───────────────────────────────────────────────────────>│
     │                                                        │
     │  3. Server stores visitor session                     │
     │  4. Admin sees "New visitor" notification             │
     │                                                        │
     │  5. Visitor sends message                             │
     │───────────────────────────────────────────────────────>│
     │                                                        │
     │  6. Server broadcasts to admin                        │
     │                                                        │
     │<───────────────────────────────────────────────────────│
     │  7. Admin replies                                     │
     │                                                        │
     │  8. Real-time bidirectional communication continues   │
     │<─────────────────────────────────────────────────────>│
     │                                                        │


## File Organization

Frontend (Root Directory)
├── index.html          → Main landing page
├── script.js           → Client-side logic
├── styles.css          → All styling
├── full.png            → Full logo
├── icon.png            → Icon/favicon
└── admin/
    └── admin.html      → Admin dashboard UI

Backend (backend/)
├── index.js            → Express server setup
├── models/
│   └── User.js         → User schema/model
├── routes/
│   ├── auth.js         → Authentication endpoints
│   └── admin.js        → Admin endpoints
└── utils/
    └── crypto.js       → Encryption utilities


## Key Design Patterns

1. **MVC (Model-View-Controller)**
   - Models: `backend/models/`
   - Views: `index.html`, `admin/admin.html`
   - Controllers: `backend/routes/`

2. **Middleware Stack**
   - Body Parser → Session → Passport → Routes

3. **Security Layers**
   - Input validation
   - Password hashing (bcrypt)
   - Data encryption (AES)
   - JWT authentication
   - OAuth 2.0 integration

4. **Real-time Communication**
   - WebSocket via Socket.IO
   - Event-driven architecture
   - Bidirectional messaging

5. **Responsive Design**
   - Mobile-first CSS
   - Breakpoints: 768px, 480px
   - Flexible grid layouts
   - Progressive enhancement
