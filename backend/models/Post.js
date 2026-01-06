const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  image_url: String,
  video_url: String,
  author_name: {
    type: String,
    required: true
  },
  author_email: {
    type: String,
    required: true,
    index: true
  },
  author_tier: {
    type: String,
    enum: ['student', 'instructor', 'master'],
    default: 'student'
  },
  author_belt: String,
  likes: [{
    type: String
  }],
  comments_count: {
    type: Number,
    default: 0
  },
  is_announcement: {
    type: Boolean,
    default: false
  },
  is_pinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

postSchema.index({ createdAt: -1 });
postSchema.index({ is_pinned: -1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
