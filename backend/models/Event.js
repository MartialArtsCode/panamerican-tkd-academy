const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  event_type: {
    type: String,
    enum: ['training', 'tournament', 'belt_test', 'seminar', 'social'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: String,
  location: String,
  image_url: String,
  attendees: [{
    type: String
  }],
  max_capacity: Number,
  required_belt: String,
  created_by: {
    type: String,
    required: true
  }
}, { timestamps: true });

eventSchema.index({ date: 1 });
eventSchema.index({ event_type: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
