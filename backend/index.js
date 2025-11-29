

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
