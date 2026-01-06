require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

/* ======================
   CONFIG
====================== */
const JWT_SECRET = process.env.JWT_SECRET || 'pta_super_secret';
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/* ======================
   APP SETUP
====================== */
const app = express();

// Determine allowed origins based on environment
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'https://martialartscode.github.io',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ];

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

// Make io available to routes
app.set('io', io);

/* ======================
   DATABASE CONNECTION
====================== */
if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.warn('⚠️ MONGO_URI not set. Using in-memory storage.');
    console.warn('💡 Add MONGO_URI to .env for persistent data.');
}

/* ======================
   IMPORT ROUTES
====================== */
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const healthRoutes = require('./routes/health');
const feedRoutes = require('./routes/feed');
const eventsRoutes = require('./routes/events');
const forumRoutes = require('./routes/forum');
const classesRoutes = require('./routes/classes');
const membersRoutes = require('./routes/members');
const notificationsRoutes = require('./routes/notifications');

/* ======================
   ROUTES
====================== */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/notifications', notificationsRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Panamerican Taekwondo Academy API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            feed: '/api/feed',
            events: '/api/events',
            forum: '/api/forum',
            classes: '/api/classes',
            members: '/api/members',
            notifications: '/api/notifications'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

/* ======================
   SOCKET.IO
====================== */
require('./sockets')(io);

/* ======================
   START SERVER
====================== */
server.listen(PORT, () => {
    console.log('\n🥋 Panamerican Taekwondo Academy Backend');
    console.log('=========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔗 Allowed origins: ${allowedOrigins.join(', ')}`);
    console.log('=========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('🔌 Server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io };
