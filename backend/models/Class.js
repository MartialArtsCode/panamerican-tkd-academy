const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  instructor_email: {
    type: String,
    required: true,
    index: true
  },
  instructor_name: String,
  day_of_week: {
    type: Number,
    min: 0,
    max: 6
  },
  start_time: String,
  end_time: String,
  location: String,
  max_students: Number,
  skill_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  belt_requirements: [String],
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

classSchema.index({ instructor_email: 1, day_of_week: 1 });
classSchema.index({ is_active: 1 });

module.exports = mongoose.model('Class', classSchema);
