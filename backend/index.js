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
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

/* ======================
   DATABASE
====================== */
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));

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
   AUTH (ADMIN)
====================== */
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Replace with real user lookup
    if (username !== 'admin' || password !== 'password123') {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
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

io.on('connection', socket => {
    console.log('🔌 Socket connected:', socket.id);

    /* ---------- IDENTIFY ---------- */
    socket.on('identify', async data => {
        if (data.type === 'visitor') {
            socket.join(data.sessionId);

            let session = await Session.findOne({ sessionId: data.sessionId });
            if (!session) {
                session = await Session.create({ sessionId: data.sessionId, online: true });
            } else {
                session.online = true;
                await session.save();
            }

            socket.emit('restore-chat', session);
            io.emit('visitor-online', { sessionId: data.sessionId });
        }

        if (data.type === 'admin') {
            const decoded = authenticateAdmin(data.token);
            if (!decoded) return socket.disconnect();

            onlineAdmins.add(socket.id);
            socket.join('admins');
            io.emit('admin-online', onlineAdmins.size);
        }
    });

    /* ---------- VISITOR MESSAGE ---------- */
    socket.on('visitor-message', async data => {
        const session = await Session.findOne({ sessionId: data.sessionId });
        if (!session) return;

        session.messages.push({ from: 'visitor', text: data.message });
        session.updatedAt = new Date();
        await session.save();

        io.to('admins').emit('visitor-message', data);
    });

    /* ---------- ADMIN RESPONSE ---------- */
    socket.on('admin-response', async data => {
        const session = await Session.findOne({ sessionId: data.sessionId });
        if (!session) return;

        session.messages.push({ from: 'admin', text: data.message });
        session.updatedAt = new Date();
        await session.save();

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
server.listen(PORT, () => {
    console.log(`🚀 PTA Chat Server running on port ${PORT}`);
});


import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET || 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/app_do', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import React, { useState } from 'react';

function FaceIDLogin({ onLogin }) {
  const [message, setMessage] = useState('');

  const handleFaceID = async () => {
    if (!window.PublicKeyCredential) {
      setMessage('Face ID/WebAuthn not supported on this browser.');
      return;
    }
    try {
      // This is a placeholder for actual WebAuthn registration/authentication
      // In production, you need to implement server-side WebAuthn challenge/response
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([/* random bytes */]),
          timeout: 60000,
          userVerification: 'required',
        }
      });
      if (credential) {
        setMessage('Face ID authentication successful!');
        onLogin && onLogin();
      } else {
        setMessage('Face ID authentication failed.');
      }
    } catch (err) {
      setMessage('Face ID error: ' + err.message);
    }
  };

  return (
    <div>
      <button onClick={handleFaceID}>Login with Face ID</button>
      <div>{message}</div>
    </div>
  );
}

export default FaceIDLogin;
