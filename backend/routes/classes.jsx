const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const TrainingModule = require('../models/TrainingModule');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all classes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const classes = await Class.find({ is_active: true })
      .sort({ day_of_week: 1, start_time: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create class (instructors only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!['instructor', 'master'].includes(req.user.tier)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const classObj = new Class({
      ...req.body,
      instructor_email: req.user.email,
      instructor_name: req.user.name
    });
    await classObj.save();
    res.status(201).json(classObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Record attendance
router.post('/:id/attendance', authenticateToken, async (req, res) => {
  try {
    if (!['instructor', 'master'].includes(req.user.tier)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const attendance = new Attendance({
      ...req.body,
      class_id: req.params.id,
      recorded_by: req.user.email
    });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get attendance for a class
router.get('/:id/attendance', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { class_id: req.params.id };
    
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

// Get training modules
router.get('/training-modules', authenticateToken, async (req, res) => {
  try {
    const { belt_level, category } = req.query;
    let query = {};
    
    if (belt_level) query.belt_level = belt_level;
    if (category) query.category = category;
    
    const modules = await TrainingModule.find(query).sort({ belt_level: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create training module (instructors only)
router.post('/training-modules', authenticateToken, async (req, res) => {
  try {
    if (!['instructor', 'master'].includes(req.user.tier)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const module = new TrainingModule({
      ...req.body,
      created_by: req.user.email
    });
    await module.save();
    res.status(201).json(module);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Assign training module to students
router.post('/training-modules/:id/assign', authenticateToken, async (req, res) => {
  try {
    if (!['instructor', 'master'].includes(req.user.tier)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const module = await TrainingModule.findById(req.params.id);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    
    const { user_emails } = req.body;
    user_emails.forEach(email => {
      if (!module.assigned_to.find(a => a.user_email === email)) {
        module.assigned_to.push({
          user_email: email,
          assigned_date: new Date()
        });
      }
    });
    
    await module.save();
    res.json(module);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark training module as completed
router.post('/training-modules/:id/complete', authenticateToken, async (req, res) => {
  try {
    const module = await TrainingModule.findById(req.params.id);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    
    const assignment = module.assigned_to.find(a => a.user_email === req.user.email);
    if (!assignment) {
      return res.status(404).json({ error: 'Module not assigned to you' });
    }
    
    assignment.completed = true;
    assignment.completed_date = new Date();
    await module.save();
    res.json(module);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
