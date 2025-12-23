# Panamerican Taekwondo Academy

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

> Professional martial arts training in Winston-Salem, NC. Programs for all ages!

## 🥋 About

The Panamerican Taekwondo Academy is a premier martial arts training center with over 20 years of excellence in teaching authentic Taekwondo. This repository contains the academy's full-stack web application featuring a public landing page, real-time chat functionality, and backend API for user authentication.

## ✨ Features

- **Responsive Landing Page**: Modern, mobile-first design with smooth animations
- **Real-time Chat Widget**: Socket.IO-powered live communication
- **Training Programs**: Four specialized programs (Power Up, Little Ninjas, Dragons, Core)
- **Class Schedule**: Interactive weekly schedule display
- **Contact Forms**: Trial class registration with FormSubmit integration
- **Authentication System**: Local, Google OAuth, and Apple Sign In
- **Admin Dashboard**: Secure administrative interface

## 🚀 Quick Start

### Frontend

The frontend is a static website that can be served directly:

```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Use a simple HTTP server
python -m http.server 8000
# or
npx http-server
```

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Create and configure your .env file
npm start
```

The backend server will start on `http://localhost:4000`

## 📋 Prerequisites

- **Frontend**: Any modern web browser
- **Backend**: 
  - Node.js (v14 or higher)
  - MongoDB (local or cloud instance)
  - npm or yarn

## 🔧 Configuration

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=mongodb://localhost:27017/app_do
JWT_SECRET=your-secret-key-here
PORT=4000
```

## 📁 Project Structure

```
├── admin/              # Admin dashboard
├── backend/            # Node.js/Express API
│   ├── models/        # Database models
│   ├── routes/        # API endpoints
│   └── utils/         # Helper functions
├── index.html         # Main landing page
├── script.js          # Client-side JavaScript
├── styles.css         # Stylesheets
└── *.png              # Images and logos
```

For detailed structure documentation, see [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md)

## 🎯 Technology Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Socket.IO (client)
- Font Awesome icons
- FormSubmit for form handling

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Passport.js (Local, Google, Apple OAuth)
- JWT authentication
- bcrypt for password hashing
- Socket.IO (server)

## 📚 Programs Offered

1. **Power Up** (All Ages): For neurodivergent students
2. **Little Ninjas** (Ages 5-9): Comprehensive Taekwondo fundamentals
3. **Dragons** (Ages 10-17): Youth leadership and competition training
4. **Core** (Ages 17+): Adult fitness and self-defense

## 📅 Class Schedule

- **Monday - Friday**: 4:00 PM - 8:00 PM
- **Saturday**: 8:30 AM - 10:30 AM

See the full schedule on the [website](index.html) or contact us for details.

## 🔐 Security Features

- Email encryption at rest
- Password hashing with bcrypt
- JWT-based authentication
- Environment variable protection
- OAuth 2.0 integration

## 🤝 Contributing

This is a private academy project. For inquiries, please contact the academy directly.

## 📞 Contact

- **Location**: 3712 Reynolda Rd, Winston-Salem, NC
- **Phone**: [(336) 624-8499](tel:+13366248499)
- **Email**: panamericantkd22@gmail.com
- **Facebook**: [@Panamericantaekwondoacademy1](https://www.facebook.com/Panamericantaekwondoacademy1/)

## 📄 License

MIT License - Copyright (c) 2025 MartialArtsDevelopmentLab

See [LICENSE](./LICENSE) for details.

## 🏆 Academy Achievements

- ✅ 500+ Students Trained
- 🏅 50+ Competition Medals
- 📅 20+ Years of Excellence
- 🌟 World Taekwondo Federation (WT) Certified
- 🌟 Global Traditional Taekwondo Federation (GTTF) Curriculum

---

**Built with discipline, respect, and excellence** 🥋
