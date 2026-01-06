const express = require('express');
const router = express.Router();
const ForumThread = require('../models/ForumThread');
const ForumReply = require('../models/ForumReply');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all threads
router.get('/threads', authenticateToken, async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    let query = {};
    
    if (category) query.category = category;
    
    const threads = await ForumThread.find(query)
      .sort({ is_pinned: -1, last_reply_at: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ForumThread.countDocuments(query);
    
    res.json({
      threads,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single thread
router.get('/threads/:id', authenticateToken, async (req, res) => {
  try {
    const thread = await ForumThread.findByIdAndUpdate(
      req.params.id,
      { $inc: { views_count: 1 } },
      { new: true }
    );
    
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new thread
router.post('/threads', authenticateToken, async (req, res) => {
  try {
    const thread = new ForumThread({
      ...req.body,
      author_email: req.user.email,
      author_name: req.user.name,
      author_tier: req.user.tier,
      last_reply_at: new Date()
    });
    await thread.save();
    res.status(201).json(thread);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get replies for a thread
router.get('/threads/:id/replies', authenticateToken, async (req, res) => {
  try {
    const replies = await ForumReply.find({ thread_id: req.params.id })
      .sort({ createdAt: 1 });
    res.json(replies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add reply to thread
router.post('/threads/:id/replies', authenticateToken, async (req, res) => {
  try {
    const reply = new ForumReply({
      thread_id: req.params.id,
      content: req.body.content,
      author_email: req.user.email,
      author_name: req.user.name,
      author_tier: req.user.tier
    });
    await reply.save();
    
    await ForumThread.findByIdAndUpdate(req.params.id, {
      $inc: { replies_count: 1 },
      last_reply_at: new Date()
    });
    
    res.status(201).json(reply);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Like/unlike reply
router.post('/replies/:id/like', authenticateToken, async (req, res) => {
  try {
    const reply = await ForumReply.findById(req.params.id);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    
    const likeIndex = reply.likes.indexOf(req.user.email);
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(req.user.email);
    }
    
    await reply.save();
    res.json(reply);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete thread
router.delete('/threads/:id', authenticateToken, async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    
    if (thread.author_email !== req.user.email && req.user.tier !== 'master') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await thread.deleteOne();
    await ForumReply.deleteMany({ thread_id: req.params.id });
    res.json({ message: 'Thread deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
