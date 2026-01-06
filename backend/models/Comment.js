const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  author_name: {
    type: String,
    required: true
  },
  author_email: {
    type: String,
    required: true
  },
  author_belt: String,
  likes: [{
    type: String
  }]
}, { timestamps: true });

commentSchema.index({ post_id: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
