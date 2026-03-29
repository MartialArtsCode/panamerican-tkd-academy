const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../utils/crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();


// Local registration
router.post('/register', async (req, res) => {
  console.log('📝 Registration attempt:', { email: req.body.email });
  
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      console.warn('❌ Registration failed: Missing credentials');
      return res.status(400).json({ message: 'Email and password required.' });
    }
    
    console.log('🔍 Checking for existing user:', email);
    const existing = await User.findOne({ email: encrypt(email) });
    
    if (existing) {
      console.warn('❌ Registration failed: User already exists:', email);
      return res.status(409).json({ message: 'User already exists.' });
    }
    
    console.log('🔒 Hashing password');
    const hashed = await bcrypt.hash(password, 10);
    
    console.log('💾 Creating pending user account');
    const user = new User({ 
      email: encrypt(email), 
      password: encrypt(hashed), 
      isAdmin: false,
      approved: false,
      tier: 'basic',
      registeredAt: new Date()
    });
    
    await user.save();
    
    console.log('✅ User registered (pending approval):', email);
    
    // Emit event to notify admins (Socket.IO will handle this)
    if (req.app.get('io')) {
      req.app.get('io').to('admins').emit('new-registration', {
        email: email,
        registeredAt: new Date().toISOString(),
        message: `New registration: ${email} is waiting for approval`
      });
      console.log('📢 Notified admins of new registration');
    }
    
    res.status(201).json({ 
      message: 'Registration submitted. Please wait for admin approval.',
      pendingApproval: true
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


// Local login
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.warn('❌ Login failed: Missing credentials');
      return res.status(400).json({ message: 'Email and password required.' });
    }
    
    console.log('🔍 Looking up user:', email);
    const user = await User.findOne({ email: encrypt(email) });
    
    if (!user) {
      console.warn('❌ Login failed: User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    console.log('✅ User found, verifying password');
    const valid = await bcrypt.compare(password, decrypt(user.password));
    
    if (!valid) {
      console.warn('❌ Login failed: Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    // Check if user is approved
    if (!user.approved && !user.isAdmin) {
      console.warn('❌ Login failed: User not approved yet:', email);
      return res.status(403).json({ 
        message: 'Your account is pending admin approval. Please wait for confirmation.',
        pendingApproval: true
      });
    }
    
    console.log('✅ Password valid, generating token');
    const token = jwt.sign(
      { email: email, isAdmin: user.isAdmin || false }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    console.log('✅ Login successful:', { email, isAdmin: user.isAdmin || false });
    res.json({ token, isAdmin: user.isAdmin || false });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  const token = jwt.sign({ email: req.user.email, isAdmin: req.user.isAdmin || false }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Apple OAuth (placeholder)
router.get('/apple', passport.authenticate('apple'));
router.post('/apple/callback', passport.authenticate('apple', { failureRedirect: '/' }), (req, res) => {
  const token = jwt.sign({ email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
