const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true
  },
  user_email: {
    type: String,
    required: true,
    index: true
  },
  user_name: String,
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  notes: String,
  recorded_by: String
}, { timestamps: true });

attendanceSchema.index({ user_email: 1, date: -1 });
attendanceSchema.index({ class_id: 1, date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
