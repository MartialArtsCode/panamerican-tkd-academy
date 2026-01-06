const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth.middleware');
const { encrypt, decrypt } = require('../utils/crypto');

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Email in database is encrypted, so encrypt the token email to search
    const user = await User.findOne({ email: encrypt(req.user.email) });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data
    res.json({
      email: req.user.email,
      name: user.name || req.user.email.split('@')[0],
      tier: user.tier || 'basic',
      belt: user.belt,
      profilePicture: user.profilePicture,
      isAdmin: user.isAdmin,
      approved: user.approved,
      registeredAt: user.registeredAt,
      familyMembers: user.familyMembers || []
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, profilePicture, belt } = req.body;
    
    // Email in database is encrypted
    const user = await User.findOne({ email: encrypt(req.user.email) });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (belt) user.belt = belt;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        email: req.user.email,
        name: user.name,
        tier: user.tier,
        belt: user.belt,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
