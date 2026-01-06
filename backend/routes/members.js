const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Attendance = require('../models/Attendance');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all members
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tier, belt, search } = req.query;
    let query = {};
    
    if (tier) query.tier = tier;
    if (belt) query.belt = belt;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const members = await User.find(query)
      .select('-password')
      .sort({ tier: 1, name: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get member profile
router.get('/:email', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email })
      .select('-password');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Get achievements
    const achievements = await Achievement.find({ user_email: req.params.email });
    
    // Get attendance stats
    const attendance = await Attendance.find({ user_email: req.params.email });
    const attendanceStats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: attendance.filter(a => a.status === 'absent').length
    };
    
    res.json({
      user,
      achievements,
      attendanceStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update member profile (self or admin)
router.put('/:email', authenticateToken, async (req, res) => {
  try {
    if (req.user.email !== req.params.email && req.user.tier !== 'master') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const allowedUpdates = ['name', 'phone', 'emergency_contact', 'bio', 'profile_picture'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { $set: updates },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Award achievement (instructors only)
router.post('/:email/achievements', authenticateToken, async (req, res) => {
  try {
    if (!['instructor', 'master'].includes(req.user.tier)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const achievement = new Achievement({
      ...req.body,
      user_email: req.params.email
    });
    await achievement.save();
    res.status(201).json(achievement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get member's achievements
router.get('/:email/achievements', authenticateToken, async (req, res) => {
  try {
    const achievements = await Achievement.find({ user_email: req.params.email })
      .sort({ awarded_date: -1 });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get member's attendance
router.get('/:email/attendance', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user_email: req.params.email };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
