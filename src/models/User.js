const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: {type: String},
  resetPasswordExpires: {type: Date},
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  accountType: { type: Number }, // type: 1 for individual, type: 2 for business
  isProfileCompleted: {type: Boolean, default: false},
  isActive: {type: Boolean}
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
