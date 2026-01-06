const mongoose = require('mongoose');

const trainingModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  belt_level: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['forms', 'sparring', 'breaking', 'self_defense', 'theory'],
    default: 'forms'
  },
  video_url: String,
  duration_minutes: Number,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  assigned_to: [{
    user_email: String,
    assigned_date: Date,
    completed: { type: Boolean, default: false },
    completed_date: Date
  }],
  created_by: String
}, { timestamps: true });

trainingModuleSchema.index({ belt_level: 1 });
trainingModuleSchema.index({ 'assigned_to.user_email': 1 });

module.exports = mongoose.model('TrainingModule', trainingModuleSchema);
