/*
 Panamerican Taekwondo Academy – Real-Time Chat Backend
 ----------------------------------------------------
 Features:
 - Socket.IO real-time messaging
 - Admin authentication (JWT)
 - MongoDB persistence (sessions + messages)
 - Multiple admins support
 - Online / offline indicators
 - Typing indicators

 Stack:
 - Node.js
 - Express
 - Socket.IO
 - MongoDB (Mongoose)
 - JWT Authentication
*/

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

/* ======================
   CONFIG
====================== */
const JWT_SECRET = process.env.JWT_SECRET || 'pta_super_secret';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pta_chat';
const PORT = process.env.PORT || 3000;

/* ======================
   APP SETUP
====================== */
const app = express();

// CORS configuration - allow GitHub Pages and localhost
const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'https://martialartscode.github.io',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:5500'
    ];

const corsOptions = {
    origin: allowedOrigins,
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
   DATABASE
====================== */
// MongoDB connection with proper configuration
const connectDB = require('./config/db');

if (process.env.MONGO_URI) {
    connectDB();
} else {
    console.log('📦 Using file-based storage (MongoDB not configured)');
    console.log('💡 Set MONGO_URI in .env to use MongoDB');
}

/* ======================
   IN-MEMORY TEST STORAGE
====================== */
const testUsers = [
    { email: 'panamericantkd22@gmail.com', password: 'admin123', isAdmin: true, tier: 'admin' },
    { email: 'admin@pta.local', password: 'admin123', isAdmin: true, tier: 'admin' },
    { email: 'test@example.com', password: 'test123', isAdmin: false, tier: 'basic' }
];

// Store for user-created accounts
const userAccounts = new Map();
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

/* ======================
   AUTH MIDDLEWARE
====================== */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Load saved users from file
function loadUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            const users = JSON.parse(data);
            users.forEach(user => {
                userAccounts.set(user.email, user);
            });
            console.log(`✅ Loaded ${userAccounts.size} user accounts from file`);
        }
    } catch (error) {
        console.warn('⚠️ Could not load users file:', error.message);
    }
}

// Save users to file
function saveUsers() {
    try {
        const dir = path.dirname(USERS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const users = Array.from(userAccounts.values());
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        console.log(`💾 Saved ${users.length} user accounts to file`);
    } catch (error) {
        console.error('❌ Error saving users:', error.message);
    }
}

// Load users on startup
loadUsers();

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
const usersRoutes = require('./routes/users');

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
app.use('/api/users', usersRoutes);

/* ======================
   MODELS
====================== */
const MessageSchema = new mongoose.Schema({
    from: { type: String, enum: ['visitor', 'admin'], required: true },
    text: String,
    timestamp: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
    sessionId: String,
    online: Boolean,
    messages: [MessageSchema],
    updatedAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', SessionSchema);

/* ======================
   AUTH ROUTES
====================== */
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Login endpoint (matches frontend expectation)
app.post('/auth/login', (req, res) => {
    console.log('🔐 Login attempt:', req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    // Check against test users (predefined accounts)
    const testUser = testUsers.find(u => u.email === email);
    if (testUser) {
        // Test users require password match
        if (testUser.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ email: testUser.email, isAdmin: testUser.isAdmin }, JWT_SECRET, { expiresIn: '8h' });
        return res.json({ token, email: testUser.email, isAdmin: testUser.isAdmin, tier: testUser.tier || 'basic' });
    }

    // Check user-created accounts
    const existingUser = userAccounts.get(email);
    if (existingUser) {
        // Verify password
        if (existingUser.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check if user is approved (admins are auto-approved)
        if (!existingUser.approved && !existingUser.isAdmin) {
            console.warn('❌ Login failed: User not approved yet:', email);
            return res.status(403).json({ 
                message: 'Your account is pending admin approval. Please wait for confirmation.',
                pendingApproval: true
            });
        }
        
        const token = jwt.sign({ email: existingUser.email, isAdmin: existingUser.isAdmin || false }, JWT_SECRET, { expiresIn: '8h' });
        return res.json({ token, email: existingUser.email, isAdmin: existingUser.isAdmin || false, tier: existingUser.tier || 'basic' });
    }

    // New user - create pending account that requires admin approval
    const newUser = {
        email, 
        password, 
        isAdmin: false,
        approved: false,
        tier: 'basic',
        registeredAt: new Date(),
        name: email.split('@')[0], // Default name from email
        profilePicture: null
    };
    
    userAccounts.set(email, newUser);
    saveUsers();
    
    console.log(`📝 New user registered (pending approval): ${email}`);
    
    // Notify admins via Socket.IO
    io.to('admins').emit('new-registration', {
        email: email,
        registeredAt: new Date().toISOString(),
        message: `New registration: ${email} is waiting for approval`
    });
    console.log('📢 Notified admins of new registration');
    
    res.status(201).json({ 
        message: 'Registration submitted. Please wait for admin approval.',
        pendingApproval: true
    });
});

// Legacy admin login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username !== 'admin' || password !== 'password123') {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'running', message: 'PTA Backend API' });
});

// Admin endpoints for tier management
app.get('/api/admin/users', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = authenticateAdmin(token);
    
    if (!user || !user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Combine test users and registered users
    const allUsers = [
        ...testUsers.map(u => ({ 
            ...u, 
            source: 'test',
            name: u.name || u.email.split('@')[0],
            profilePicture: u.profilePicture || null
        })),
        ...Array.from(userAccounts.values()).map(u => ({ 
            ...u, 
            source: 'registered',
            name: u.name || u.email.split('@')[0],
            profilePicture: u.profilePicture || null
        }))
    ];
    
    res.json({ users: allUsers });
});

app.put('/api/admin/users/:email/tier', authMiddleware, (req, res) => {
    console.log('📥 Tier update request:', { 
        email: req.params.email, 
        tier: req.body.tier,
        user: req.user 
    });
    
    const { email } = req.params;
    const { tier } = req.body;
    
    const validTiers = ['basic', 'premium', 'vip', 'instructor', 'admin'];
    if (!validTiers.includes(tier)) {
        console.log('❌ Invalid tier:', tier);
        return res.status(400).json({ error: 'Invalid tier' });
    }
    
    // Update in userAccounts
    const existingUser = userAccounts.get(email);
    if (existingUser) {
        console.log('✅ Updating user in userAccounts:', email);
        existingUser.tier = tier;
        userAccounts.set(email, existingUser);
        saveUsers();
        return res.json({ message: 'Tier updated successfully', user: existingUser });
    }
    
    // Update in testUsers
    const testUser = testUsers.find(u => u.email === email);
    if (testUser) {
        console.log('✅ Updating user in testUsers:', email);
        testUser.tier = tier;
        return res.json({ message: 'Tier updated successfully', user: testUser });
    }
    
    console.log('❌ User not found:', email);
    res.status(404).json({ error: 'User not found' });
});

// Get pending user registrations
app.get('/api/admin/pending-users', authMiddleware, (req, res) => {
    console.log('📋 Fetching pending registrations');
    
    try {
        // Filter users that are not approved
        const pendingUsers = Array.from(userAccounts.values())
            .filter(u => !u.approved && !u.isAdmin)
            .map(u => ({
                id: u.email, // Using email as ID since we don't have MongoDB _id
                email: u.email,
                tier: u.tier || 'basic',
                registeredAt: u.registeredAt || new Date()
            }));
        
        console.log('✅ Found pending users:', pendingUsers.length);
        res.json(pendingUsers);
    } catch (error) {
        console.error('❌ Error fetching pending users:', error);
        res.status(500).json({ error: 'Failed to fetch pending users' });
    }
});

// Approve user registration
app.post('/api/admin/approve-user/:userId', authMiddleware, (req, res) => {
    const { userId } = req.params; // userId is email in our case
    const { tier } = req.body;
    
    console.log('✅ User approval request:', userId);
    
    try {
        const user = userAccounts.get(userId);
        
        if (!user) {
            console.warn('❌ User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.approved = true;
        user.approvedAt = new Date();
        user.approvedBy = req.user.email || 'admin';
        if (tier) user.tier = tier;
        
        userAccounts.set(userId, user);
        saveUsers();
        
        console.log('✅ User approved:', userId);
        
        // Notify the user via Socket.IO
        io.emit('account-approved', {
            email: userId,
            message: 'Your account has been approved! You can now log in.'
        });
        
        res.json({ 
            message: 'User approved successfully',
            user: {
                id: userId,
                email: userId,
                tier: user.tier,
                approved: true
            }
        });
    } catch (error) {
        console.error('❌ Error approving user:', error);
        res.status(500).json({ error: 'Failed to approve user' });
    }
});

// Reject user registration
app.delete('/api/admin/reject-user/:userId', authMiddleware, (req, res) => {
    const { userId } = req.params; // userId is email
    
    console.log('❌ User rejection request:', userId);
    
    try {
        if (!userAccounts.has(userId)) {
            console.warn('❌ User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }
        
        userAccounts.delete(userId);
        saveUsers();
        
        console.log('✅ User rejected and deleted:', userId);
        
        res.json({ message: 'User registration rejected and removed' });
    } catch (error) {
        console.error('❌ Error rejecting user:', error);
        res.status(500).json({ error: 'Failed to reject user' });
    }
});

// Password change endpoint
app.put('/api/users/change-password', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = authenticateAdmin(token);
    
    if (!user) {
        return res.status(403).json({ error: 'Authentication required' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new passwords required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    const email = user.email;
    
    // Check test users first
    const testUser = testUsers.find(u => u.email === email);
    if (testUser) {
        if (testUser.password !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        testUser.password = newPassword;
        testUser.lastPasswordChange = new Date().toISOString();
        return res.json({ message: 'Password changed successfully' });
    }
    
    // Check registered users
    const existingUser = userAccounts.get(email);
    if (existingUser) {
        if (existingUser.password !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        existingUser.password = newPassword;
        existingUser.lastPasswordChange = new Date().toISOString();
        userAccounts.set(email, existingUser);
        saveUsers();
        return res.json({ message: 'Password changed successfully' });
    }
    
    res.status(404).json({ error: 'User not found' });
});

// Update user profile (name and profile picture)
app.put('/api/users/profile', authMiddleware, (req, res) => {
    console.log('📝 Profile update request:', req.user.email);
    
    try {
        const { name, profilePicture } = req.body;
        
        if (!name && profilePicture === undefined) {
            return res.status(400).json({ error: 'Name or profile picture required' });
        }
        
        // Find user in userAccounts
        const user = userAccounts.get(req.user.email);
        
        if (!user) {
            // Check test users
            const testUser = testUsers.find(u => u.email === req.user.email);
            if (testUser) {
                if (name) testUser.name = name;
                if (profilePicture !== undefined) testUser.profilePicture = profilePicture;
                testUser.updatedAt = new Date();
                console.log('✅ Test user profile updated');
                return res.json({ 
                    message: 'Profile updated successfully',
                    user: {
                        email: testUser.email,
                        name: testUser.name,
                        profilePicture: testUser.profilePicture,
                        tier: testUser.tier
                    }
                });
            }
            console.warn('❌ User not found:', req.user.email);
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update fields
        if (name) {
            user.name = name;
            console.log('✅ Updated name:', name);
        }
        if (profilePicture !== undefined) {
            user.profilePicture = profilePicture;
            console.log('✅ Updated profile picture');
        }
        
        user.updatedAt = new Date();
        userAccounts.set(req.user.email, user);
        saveUsers();
        
        console.log('✅ Profile updated successfully');
        res.json({ 
            message: 'Profile updated successfully',
            user: {
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture,
                tier: user.tier
            }
        });
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get user profile
app.get('/api/users/profile', authMiddleware, (req, res) => {
    try {
        const user = userAccounts.get(req.user.email) || testUsers.find(u => u.email === req.user.email);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            email: user.email,
            name: user.name || user.email.split('@')[0],
            profilePicture: user.profilePicture || null,
            tier: user.tier || 'basic',
            isAdmin: user.isAdmin || false
        });
    } catch (error) {
        console.error('❌ Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Auto-response settings endpoints
const autoResponseFilePath = path.join(__dirname, 'data', 'auto-response.json');

// Load auto-response settings
function loadAutoResponseSettings() {
    try {
        if (fs.existsSync(autoResponseFilePath)) {
            const data = fs.readFileSync(autoResponseFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.log('No auto-response settings found, using defaults');
    }
    return { enabled: false, message: 'Thanks for reaching out! We\'ll respond shortly...', delay: 2 };
}

// Save auto-response settings
function saveAutoResponseSettings(settings) {
    try {
        const dir = path.dirname(autoResponseFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(autoResponseFilePath, JSON.stringify(settings, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving auto-response settings:', err);
        return false;
    }
}

// Get auto-response settings
app.get('/api/admin/auto-response', (req, res) => {
    const settings = loadAutoResponseSettings();
    res.json(settings);
});

// Update auto-response settings
app.put('/api/admin/auto-response', (req, res) => {
    const { enabled, message, delay } = req.body;
    
    if (enabled && !message) {
        return res.status(400).json({ error: 'Message is required when auto-response is enabled' });
    }
    
    const settings = {
        enabled: !!enabled,
        message: message || '',
        delay: Math.max(0, Math.min(60, parseInt(delay) || 2))
    };
    
    if (saveAutoResponseSettings(settings)) {
        res.json({ message: 'Settings saved successfully', settings });
    } else {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

/* ======================
   QUICK REPLY TEMPLATES
====================== */
const TEMPLATES_FILE = path.join(__dirname, 'data', 'templates.json');

function loadTemplates() {
    try {
        if (!fs.existsSync(TEMPLATES_FILE)) {
            return [];
        }
        const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading templates:', error);
        return [];
    }
}

function saveTemplates(templates) {
    try {
        const dir = path.dirname(TEMPLATES_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving templates:', error);
        return false;
    }
}

// Get all templates
app.get('/api/admin/templates', authMiddleware, (req, res) => {
    const templates = loadTemplates();
    res.json({ templates });
});

// Create new template
app.post('/api/admin/templates', authMiddleware, (req, res) => {
    const { name, message } = req.body;
    
    if (!name || !message) {
        return res.status(400).json({ error: 'Name and message are required' });
    }
    
    const templates = loadTemplates();
    const newTemplate = {
        id: Date.now().toString(),
        name: name.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString()
    };
    
    templates.push(newTemplate);
    
    if (saveTemplates(templates)) {
        res.json({ message: 'Template created successfully', template: newTemplate });
    } else {
        res.status(500).json({ error: 'Failed to save template' });
    }
});

// Update template
app.put('/api/admin/templates/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { name, message } = req.body;
    
    if (!name || !message) {
        return res.status(400).json({ error: 'Name and message are required' });
    }
    
    const templates = loadTemplates();
    const templateIndex = templates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
        return res.status(404).json({ error: 'Template not found' });
    }
    
    templates[templateIndex] = {
        ...templates[templateIndex],
        name: name.trim(),
        message: message.trim(),
        updatedAt: new Date().toISOString()
    };
    
    if (saveTemplates(templates)) {
        res.json({ message: 'Template updated successfully', template: templates[templateIndex] });
    } else {
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// Delete template
app.delete('/api/admin/templates/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    
    const templates = loadTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    if (templates.length === filteredTemplates.length) {
        return res.status(404).json({ error: 'Template not found' });
    }
    
    if (saveTemplates(filteredTemplates)) {
        res.json({ message: 'Template deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

function authenticateAdmin(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

/* ======================
   SOCKET.IO LOGIC
====================== */
let onlineAdmins = new Set();
let inMemorySessions = new Map(); // In-memory session storage for testing

io.on('connection', socket => {
    console.log('🔌 Socket connected:', socket.id);

    /* ---------- IDENTIFY ---------- */
    socket.on('identify', async data => {
        if (data.type === 'visitor') {
            socket.join(data.sessionId);

            try {
                // Try MongoDB first, fall back to in-memory
                let session = Session ? await Session.findOne({ sessionId: data.sessionId }).catch(() => null) : null;
                
                if (!session && !inMemorySessions.has(data.sessionId)) {
                    // Create in-memory session
                    session = {
                        sessionId: data.sessionId,
                        online: true,
                        messages: [],
                        updatedAt: new Date()
                    };
                    inMemorySessions.set(data.sessionId, session);
                } else if (!session) {
                    session = inMemorySessions.get(data.sessionId);
                    session.online = true;
                } else {
                    session.online = true;
                    await session.save().catch(() => {});
                }

                socket.emit('restore-chat', session);
            } catch (err) {
                console.log('Using in-memory session storage');
                if (!inMemorySessions.has(data.sessionId)) {
                    inMemorySessions.set(data.sessionId, {
                        sessionId: data.sessionId,
                        online: true,
                        messages: []
                    });
                }
                socket.emit('restore-chat', inMemorySessions.get(data.sessionId));
            }
            // Notify all admins about new visitor
            io.to('admins').emit('visitor-online', { sessionId: data.sessionId });
        }

        if (data.type === 'admin') {
            const decoded = authenticateAdmin(data.token);
            if (!decoded) {
                console.log('❌ Admin authentication failed');
                return socket.disconnect();
            }

            onlineAdmins.add(socket.id);
            socket.join('admins');
            console.log('✅ Admin authenticated and joined admins room:', socket.id);
            console.log('👥 Online admins:', onlineAdmins.size);
            io.emit('admin-online', onlineAdmins.size);
        }
    });

    /* ---------- VISITOR MESSAGE ---------- */
    socket.on('visitor-message', async data => {
        console.log('📨 Visitor message received:', data);
        try {
            const session = Session ? await Session.findOne({ sessionId: data.sessionId }).catch(() => null) : null;
            if (session) {
                session.messages.push({ from: 'visitor', text: data.message });
                session.updatedAt = new Date();
                await session.save().catch(() => {});
            } else if (inMemorySessions.has(data.sessionId)) {
                const memSession = inMemorySessions.get(data.sessionId);
                memSession.messages.push({ from: 'visitor', text: data.message, timestamp: new Date() });
            }
        } catch (err) {
            if (inMemorySessions.has(data.sessionId)) {
                const memSession = inMemorySessions.get(data.sessionId);
                memSession.messages.push({ from: 'visitor', text: data.message, timestamp: new Date() });
            }
        }

        console.log('📤 Emitting visitor-message to admins room');
        console.log('👥 Current admins in room:', onlineAdmins.size);
        io.to('admins').emit('visitor-message', data);

        // Check if we should send auto-response
        const autoResponseSettings = loadAutoResponseSettings();
        if (autoResponseSettings.enabled && onlineAdmins.size === 0) {
            // Only send auto-response if no admins are online
            const memSession = inMemorySessions.get(data.sessionId);
            const isFirstMessage = memSession && memSession.messages.length === 1;
            
            if (isFirstMessage) {
                setTimeout(() => {
                    const autoResponse = {
                        sessionId: data.sessionId,
                        message: autoResponseSettings.message,
                        from: 'admin',
                        auto: true
                    };
                    
                    // Save to session
                    if (memSession) {
                        memSession.messages.push({ from: 'admin', text: autoResponseSettings.message, timestamp: new Date(), auto: true });
                    }
                    
                    // Send to visitor
                    io.to(data.sessionId).emit('admin-response', autoResponse);
                    console.log('🤖 Auto-response sent to:', data.sessionId);
                }, autoResponseSettings.delay * 1000);
            }
        }
    });

    /* ---------- ADMIN RESPONSE ---------- */
    socket.on('admin-response', async data => {
        try {
            const session = Session ? await Session.findOne({ sessionId: data.sessionId }).catch(() => null) : null;
            if (session) {
                session.messages.push({ from: 'admin', text: data.message });
                session.updatedAt = new Date();
                await session.save().catch(() => {});
            } else if (inMemorySessions.has(data.sessionId)) {
                const memSession = inMemorySessions.get(data.sessionId);
                memSession.messages.push({ from: 'admin', text: data.message, timestamp: new Date() });
            }
        } catch (err) {
            if (inMemorySessions.has(data.sessionId)) {
                const memSession = inMemorySessions.get(data.sessionId);
                memSession.messages.push({ from: 'admin', text: data.message, timestamp: new Date() });
            }
        }

        io.to(data.sessionId).emit('admin-response', data);
    });

    /* ---------- TYPING INDICATORS ---------- */
    socket.on('typing', data => {
        socket.to(data.sessionId).emit('typing', data);
    });

    /* ---------- DISCONNECT ---------- */
    socket.on('disconnect', async () => {
        onlineAdmins.delete(socket.id);
        io.emit('admin-online', onlineAdmins.size);

        const sessions = await Session.find({ online: true });
        for (const s of sessions) {
            s.online = false;
            await s.save();
            io.emit('visitor-offline', { sessionId: s.sessionId });
        }

        console.log('❌ Socket disconnected:', socket.id);
    });
});

/* ======================
   START SERVER
====================== */
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PTA Chat Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Storage: File-based (backend/data/users.json)`);
    console.log(`✅ Server ready to accept connections`);
});
