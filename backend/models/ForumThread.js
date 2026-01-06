const mongoose = require('mongoose');

const forumThreadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author_email: {
    type: String,
    required: true,
    index: true
  },
  author_name: {
    type: String,
    required: true
  },
  author_tier: String,
  category: {
    type: String,
    enum: ['general', 'techniques', 'training', 'events', 'belt_tests', 'questions'],
    default: 'general'
  },
  is_pinned: {
    type: Boolean,
    default: false
  },
  replies_count: {
    type: Number,
    default: 0
  },
  views_count: {
    type: Number,
    default: 0
  },
  last_reply_at: Date
}, { timestamps: true });

forumThreadSchema.index({ is_pinned: -1, last_reply_at: -1 });
forumThreadSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('ForumThread', forumThreadSchema);
