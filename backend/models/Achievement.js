const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  icon: String,
  category: {
    type: String,
    enum: ['belt', 'tournament', 'training', 'community', 'special'],
    default: 'training'
  },
  user_email: {
    type: String,
    required: true,
    index: true
  },
  awarded_date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
