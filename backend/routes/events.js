const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, upcoming } = req.query;
    let query = {};
    
    if (type) query.event_type = type;
    if (upcoming === 'true') query.date = { $gte: new Date() };
    
    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (instructors and masters only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!['instructor', 'master'].includes(req.user.tier)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const event = new Event({
      ...req.body,
      created_by: req.user.email
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    if (event.created_by !== req.user.email && req.user.tier !== 'master') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// RSVP to event
router.post('/:id/rsvp', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    const attendeeIndex = event.attendees.indexOf(req.user.email);
    if (attendeeIndex > -1) {
      event.attendees.splice(attendeeIndex, 1);
    } else {
      if (event.max_capacity && event.attendees.length >= event.max_capacity) {
        return res.status(400).json({ error: 'Event is full' });
      }
      event.attendees.push(req.user.email);
    }
    
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    if (event.created_by !== req.user.email && req.user.tier !== 'master') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
