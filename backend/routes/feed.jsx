const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all posts (feed)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const posts = await Post.find()
      .sort({ is_pinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments();
    
    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author_email: req.user.email,
      author_name: req.user.name,
      author_tier: req.user.tier,
      author_belt: req.user.belt
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Like/unlike post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const likeIndex = post.likes.indexOf(req.user.email);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user.email);
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get comments for a post
router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const comments = await Comment.find({ post_id: req.params.id })
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to post
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const comment = new Comment({
      post_id: req.params.id,
      content: req.body.content,
      author_email: req.user.email,
      author_name: req.user.name,
      author_belt: req.user.belt
    });
    await comment.save();
    
    await Post.findByIdAndUpdate(req.params.id, {
      $inc: { comments_count: 1 }
    });
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete post (author or admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    if (post.author_email !== req.user.email && req.user.tier !== 'master') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await post.deleteOne();
    await Comment.deleteMany({ post_id: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
