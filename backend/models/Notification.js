const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient_email: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['message', 'event', 'achievement', 'post', 'comment', 'forum', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: String,
  link: String,
  read: {
    type: Boolean,
    default: false
  },
  sender_email: String,
  sender_name: String
}, { timestamps: true });

notificationSchema.index({ recipient_email: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
