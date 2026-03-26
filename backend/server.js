
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
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

// Allowed origins
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'https://martialartscode.github.io',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ];

const corsOptions = {
    origin: (origin, callback) => {
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

// Serve static files (Your frontend folder)
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (NODE_ENV === 'development') ? "*" : allowedOrigins,
        credentials: true
    }
});

app.set('io', io);

/* ======================
   DATABASE CONNECTION
====================== */
if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.warn('⚠️ MONGO_URI not set. Using in-memory storage.');
}

/* ======================
   VISITOR TRACKING LOGIC
====================== */
let activeVisitors = 0;

io.on('connection', (socket) => {
    activeVisitors++;
    io.emit('visitorCount', activeVisitors);
    console.log(`👤 Visitor connected. Current: ${activeVisitors}`);

    socket.on('disconnect', () => {
        activeVisitors = Math.max(0, activeVisitors - 1);
        io.emit('visitorCount', activeVisitors);
        console.log(`👤 Visitor disconnected. Current: ${activeVisitors}`);
    });
});

/* ======================
   IMPORT & USE ROUTES
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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Panamerican Taekwondo Academy API',
        version: '1.0.0',
        activeVisitors: activeVisitors,
        status: 'running'
    });
});

/* ======================
   SOCKET.IO CUSTOM MODULE
====================== */
// Keep your original sockets module if you have one
if (require.resolve('./sockets')) {
    require('./sockets')(io);
}

/* ======================
   START SERVER
====================== */
server.listen(PORT, () => {
    console.log('\n🥋 Panamerican Taekwondo Academy Backend');
    console.log('=========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`👥 Tracking live visitors enabled`);
    console.log('=========================================\n');
});

// Error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = { app, server, io };
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
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

// Allowed origins
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'https://martialartscode.github.io',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ];

const corsOptions = {
    origin: (origin, callback) => {
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

// Serve static files (Your frontend folder)
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (NODE_ENV === 'development') ? "*" : allowedOrigins,
        credentials: true
    }
});

app.set('io', io);

/* ======================
   DATABASE CONNECTION
====================== */
if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.warn('⚠️ MONGO_URI not set. Using in-memory storage.');
}

/* ======================
   VISITOR TRACKING LOGIC
====================== */
let activeVisitors = 0;

io.on('connection', (socket) => {
    activeVisitors++;
    io.emit('visitorCount', activeVisitors);
    console.log(`👤 Visitor connected. Current: ${activeVisitors}`);

    socket.on('disconnect', () => {
        activeVisitors = Math.max(0, activeVisitors - 1);
        io.emit('visitorCount', activeVisitors);
        console.log(`👤 Visitor disconnected. Current: ${activeVisitors}`);
    });
});

/* ======================
   IMPORT & USE ROUTES
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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Panamerican Taekwondo Academy API',
        version: '1.0.0',
        activeVisitors: activeVisitors,
        status: 'running'
    });
});

/* ======================
   SOCKET.IO CUSTOM MODULE
====================== */
// Keep your original sockets module if you have one
if (require.resolve('./sockets')) {
    require('./sockets')(io);
}

/* ======================
   START SERVER
====================== */
server.listen(PORT, () => {
    console.log('\n🥋 Panamerican Taekwondo Academy Backend');
    console.log('=========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`👥 Tracking live visitors enabled`);
    console.log('=========================================\n');
});

// Error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = { app, server, io };
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
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

// Allowed origins
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'https://martialartscode.github.io',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ];

const corsOptions = {
    origin: (origin, callback) => {
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

// Serve static files (Your frontend folder)
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (NODE_ENV === 'development') ? "*" : allowedOrigins,
        credentials: true
    }
});

app.set('io', io);

/* ======================
   DATABASE CONNECTION
====================== */
if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.warn('⚠️ MONGO_URI not set. Using in-memory storage.');
}

/* ======================
   VISITOR TRACKING LOGIC
====================== */
let activeVisitors = 0;

io.on('connection', (socket) => {
    activeVisitors++;
    io.emit('visitorCount', activeVisitors);
    console.log(`👤 Visitor connected. Current: ${activeVisitors}`);

    socket.on('disconnect', () => {
        activeVisitors = Math.max(0, activeVisitors - 1);
        io.emit('visitorCount', activeVisitors);
        console.log(`👤 Visitor disconnected. Current: ${activeVisitors}`);
    });
});

/* ======================
   IMPORT & USE ROUTES
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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Panamerican Taekwondo Academy API',
        version: '1.0.0',
        activeVisitors: activeVisitors,
        status: 'running'
    });
});

/* ======================
   SOCKET.IO CUSTOM MODULE
====================== */
// Keep your original sockets module if you have one
if (require.resolve('./sockets')) {
    require('./sockets')(io);
}

/* ======================
   START SERVER
====================== */
server.listen(PORT, () => {
    console.log('\n🥋 Panamerican Taekwondo Academy Backend');
    console.log('=========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`👥 Tracking live visitors enabled`);
    console.log('=========================================\n');
});

// Error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = { app, server, io };
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
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

// Allowed origins
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'https://martialartscode.github.io',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ];

const corsOptions = {
    origin: (origin, callback) => {
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

// Serve static files (Your frontend folder)
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (NODE_ENV === 'development') ? "*" : allowedOrigins,
        credentials: true
    }
});

app.set('io', io);

/* ======================
   DATABASE CONNECTION
====================== */
if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.warn('⚠️ MONGO_URI not set. Using in-memory storage.');
}

/* ======================
   VISITOR TRACKING LOGIC
====================== */
let activeVisitors = 0;

io.on('connection', (socket) => {
    activeVisitors++;
    io.emit('visitorCount', activeVisitors);
    console.log(`👤 Visitor connected. Current: ${activeVisitors}`);

    socket.on('disconnect', () => {
        activeVisitors = Math.max(0, activeVisitors - 1);
        io.emit('visitorCount', activeVisitors);
        console.log(`👤 Visitor disconnected. Current: ${activeVisitors}`);
    });
});

/* ======================
   IMPORT & USE ROUTES
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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Panamerican Taekwondo Academy API',
        version: '1.0.0',
        activeVisitors: activeVisitors,
        status: 'running'
    });
});

/* ======================
   SOCKET.IO CUSTOM MODULE
====================== */
// Keep your original sockets module if you have one
if (require.resolve('./sockets')) {
    require('./sockets')(io);
}

/* ======================
   START SERVER
====================== */
server.listen(PORT, () => {
    console.log('\n🥋 Panamerican Taekwondo Academy Backend');
    console.log('=========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`👥 Tracking live visitors enabled`);
    console.log('=========================================\n');
});

// Error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = { app, server, io };
