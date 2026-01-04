
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { encrypt, decrypt } from '../utils/crypto.js';
import User from '../models/User.js';
const router = express.Router();

// Simple admin check middleware
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Admin access required.' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}


// Admin creates user by email
router.post('/create-user', adminAuth, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
  const existing = await User.findOne({ email: encrypt(email) });
  if (existing) return res.status(409).json({ message: 'User already exists.' });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email: encrypt(email), password: encrypt(hashed), isAdmin: false });
  await user.save();
  res.status(201).json({ message: 'User created by admin.' });
});


// Admin removes user by email
router.delete('/remove-user', adminAuth, async (req, res) => {
  const { email } = req.body;
  const user = await User.findOneAndDelete({ email: encrypt(email) });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.status(200).json({ message: 'User removed by admin.' });
});

export default router;
