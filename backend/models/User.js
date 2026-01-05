import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  tier: { type: String, default: 'basic', enum: ['basic', 'premium', 'vip', 'instructor', 'admin'] },
  registeredAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String }
});

const User = mongoose.model('User', userSchema);
export default User;
