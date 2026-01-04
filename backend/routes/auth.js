
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { encrypt, decrypt } from '../utils/crypto.js';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();


// Local registration
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
  const existing = await User.findOne({ email: encrypt(email) });
  if (existing) return res.status(409).json({ message: 'User already exists.' });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email: encrypt(email), password: encrypt(hashed), isAdmin: false });
  await user.save();
  res.status(201).json({ message: 'User registered.' });
});


// Local login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: encrypt(email) });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
  const valid = await bcrypt.compare(password, decrypt(user.password));
  if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
  const token = jwt.sign({ email: email, isAdmin: user.isAdmin || false }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
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

export default router;
