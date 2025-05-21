const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  password: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  is_staff: { type: Boolean, default: false },
  is_superuser: { type: Boolean, default: false },
  is_admin: { type: Boolean, default: false },
  is_customer: { type: Boolean, default: true },
  is_seller: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },
  date_joined: { type: Date, default: Date.now },
  customer_phone: { type: String },
  customer_address: { type: String }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;