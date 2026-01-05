
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

// Get all users (for admin management)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({});
    const decryptedUsers = users.map(u => ({
      id: u._id,
      email: decrypt(u.email),
      isAdmin: u.isAdmin,
      approved: u.approved,
      tier: u.tier || 'basic',
      registeredAt: u.registeredAt,
      approvedAt: u.approvedAt,
      approvedBy: u.approvedBy
    }));
    res.json(decryptedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get pending registrations
router.get('/pending-users', adminAuth, async (req, res) => {
  console.log('📋 Fetching pending registrations');
  
  try {
    const pendingUsers = await User.find({ approved: false, isAdmin: false });
    const decryptedUsers = pendingUsers.map(u => ({
      id: u._id,
      email: decrypt(u.email),
      tier: u.tier || 'basic',
      registeredAt: u.registeredAt
    }));
    
    console.log('✅ Found pending users:', decryptedUsers.length);
    res.json(decryptedUsers);
  } catch (err) {
    console.error('❌ Error fetching pending users:', err);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

// Approve user registration
router.post('/approve-user/:userId', adminAuth, async (req, res) => {
  console.log('✅ User approval request:', req.params.userId);
  
  try {
    const { userId } = req.params;
    const { tier } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.warn('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.approved = true;
    user.approvedAt = new Date();
    user.approvedBy = req.user.email || 'admin';
    if (tier) user.tier = tier;
    
    await user.save();
    
    const userEmail = decrypt(user.email);
    console.log('✅ User approved:', userEmail);
    
    // Notify the user via Socket.IO if they're connected
    if (req.app.get('io')) {
      req.app.get('io').emit('account-approved', {
        email: userEmail,
        message: 'Your account has been approved! You can now log in.'
      });
    }
    
    res.json({ 
      message: 'User approved successfully',
      user: {
        id: user._id,
        email: userEmail,
        tier: user.tier,
        approved: true
      }
    });
  } catch (err) {
    console.error('❌ Error approving user:', err);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Reject user registration
router.delete('/reject-user/:userId', adminAuth, async (req, res) => {
  console.log('❌ User rejection request:', req.params.userId);
  
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      console.warn('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userEmail = decrypt(user.email);
    await User.findByIdAndDelete(userId);
    
    console.log('✅ User rejected and deleted:', userEmail);
    
    res.json({ message: 'User registration rejected and removed' });
  } catch (err) {
    console.error('❌ Error rejecting user:', err);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

export default router;
