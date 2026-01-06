const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  profilePicture: { type: String },
  belt: { type: String, enum: ['white', 'yellow', 'green', 'blue', 'red', 'black'], default: 'white' },
  isAdmin: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  tier: { type: String, default: 'basic', enum: ['basic', 'premium', 'vip', 'instructor', 'admin'] },
  familyMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  registeredAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
