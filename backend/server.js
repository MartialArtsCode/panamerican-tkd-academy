require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // Added axios for reliable server-side WhatsApp alerts
const connectDB = require('./config/db');

/* ======================
   CONFIG
====================== */
const JWT_SECRET = process.env.JWT_SECRET || 'pta_super_secret';
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || 'YOUR_KEY_HERE';
const MY_PHONE = '13366248499';

/* ======================
   APP SETUP
====================== */
const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'https://martialartscode.github.io',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:3000'
    ];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || NODE_ENV === 'development') return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
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

// Serve static files from the root directory (up one level from /backend)
app.use(express.static(path.join(__dirname, '../')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // More permissive for local testing
        credentials: true
    }
});

app.set('io', io);

/* ======================
   DATABASE CONNECTION
====================== */
if (process.env.MONGO_URI) {
    connectDB();
}

/* ======================
   SERVER-SIDE WHATSAPP ALERT
====================== */
async function sendWhatsAppAlert(message) {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${MY_PHONE}&text=${encodeURIComponent(message)}&apikey=${CALLMEBOT_API_KEY}`;
    try {
        await axios.get(url);
        console.log('📲 WhatsApp alert sent successfully.');
    } catch (err) {
        console.error('❌ WhatsApp alert failed:', err.message);
    }
}

/* ======================
   VISITOR TRACKING & SOCKETS
====================== */
let activeVisitors = 0;

io.on('connection', (socket) => {
    activeVisitors++;
    io.emit('visitorCount', activeVisitors);
    console.log(`👤 Visitor connected. Total: ${activeVisitors}`);

    // Trigger WhatsApp alert on first connection
    sendWhatsAppAlert(`🥋 *App-Do Visit:* 1 person just landed on the site. Total: ${activeVisitors}`);

    socket.on('disconnect', () => {
        activeVisitors = Math.max(0, activeVisitors - 1);
        io.emit('visitorCount', activeVisitors);
        console.log(`👤 Visitor disconnected. Total: ${activeVisitors}`);
    });
});

/* ======================
   ROUTES
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

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/notifications', notificationsRoutes);

// --- ADMIN MONITOR ROUTE ---
app.get('/pta-admin-monitor', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

app.get('/', (req, res) => {
    res.json({ status: 'running', activeVisitors });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

/* ======================
   START SERVER
====================== */
server.listen(PORT, () => {
    console.log(`\n🥋 Academy Backend Active on Port ${PORT}`);
    console.log(`📊 Monitor: http://localhost:${PORT}/pta-admin-monitor\n`);
});

module.exports = { app, server, io };
