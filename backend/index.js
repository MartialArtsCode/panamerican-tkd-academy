
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET || 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/app_do', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

// Socket.IO connection handling
const activeSessions = new Map();
const adminSockets = new Set();

io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);
  
  socket.on('identify', (data) => {
    if (data.type === 'admin') {
      adminSockets.add(socket.id);
      console.log('Admin connected:', socket.id);
      
      // Send active sessions to admin
      const sessions = Array.from(activeSessions.values());
      socket.emit('active-sessions', sessions);
    } else if (data.type === 'visitor') {
      const sessionId = data.sessionId;
      
      if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, {
          sessionId,
          socketId: socket.id,
          messages: [],
          lastMessage: '',
          lastTime: new Date().toISOString()
        });
      } else {
        activeSessions.get(sessionId).socketId = socket.id;
      }
      
      console.log('Visitor connected:', sessionId);
      
      // Restore chat history if exists
      const session = activeSessions.get(sessionId);
      if (session && session.messages.length > 0) {
        socket.emit('restore-chat', session);
      }
      
      // Notify all admins of new session
      notifyAdmins('active-sessions', Array.from(activeSessions.values()));
    }
  });
  
  socket.on('visitor-message', (data) => {
    console.log('Visitor message received:', data);
    const { sessionId, message, timestamp } = data;
    
    if (activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      session.messages.push({ type: 'received', text: message, timestamp });
      session.lastMessage = message;
      session.lastTime = timestamp;
      
      // Notify all admins
      notifyAdmins('new-visitor-message', {
        sessionId,
        message,
        timestamp
      });
    }
  });
  
  socket.on('admin-response', (data) => {
    console.log('Admin response:', data);
    const { sessionId, message, timestamp } = data;
    
    if (activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      session.messages.push({ type: 'sent', text: message, timestamp });
      
      // Send to visitor
      const visitorSocket = io.sockets.sockets.get(session.socketId);
      if (visitorSocket) {
        visitorSocket.emit('admin-response', { message: { text: message, timestamp } });
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    
    // Remove from admin sockets
    adminSockets.delete(socket.id);
    
    // Check if it's a visitor session
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.socketId === socket.id) {
        console.log('Visitor session disconnected:', sessionId);
        // Keep the session for potential reconnection
        // Optionally clean up after some time
      }
    }
  });
});

function notifyAdmins(event, data) {
  adminSockets.forEach(socketId => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit(event, data);
    }
  });
}

const PORT = process.env.PORT || 4000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3000;

httpServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server running on port ${SOCKET_PORT}`);
});

app.listen(PORT, () => {
  console.log(`Express API server running on port ${PORT}`);
});

