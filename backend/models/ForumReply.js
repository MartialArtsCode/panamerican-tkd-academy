const mongoose = require('mongoose');

const forumReplySchema = new mongoose.Schema({
  thread_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumThread',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  author_email: {
    type: String,
    required: true
  },
  author_name: {
    type: String,
    required: true
  },
  author_tier: String,
  likes: [{
    type: String
  }]
}, { timestamps: true });

forumReplySchema.index({ thread_id: 1, createdAt: 1 });

module.exports = mongoose.model('ForumReply', forumReplySchema);
