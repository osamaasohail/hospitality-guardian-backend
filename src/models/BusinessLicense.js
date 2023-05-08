const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const businessLicenseSchema = new Schema({
  refUser: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
  dutyManagers: [{type: mongoose.Schema.Types.ObjectId, ref: 'DutyManagers'}],
  name: { type: String, required: true },
  role: { type: Number, required: true }, // type: 1 for owner, type: 2 for manager
  licenseNumber: { type: String, required: true },
  expiryDate: { type: Date, default: false },
  gamingLicense: { type: String},
  gamingLicenseExpiry: {type: Date},
  sendNotiBeforeExpiry: [{type: Number}], // in days
  isActive: {type: Boolean}
}, { timestamps: true });
module.exports = mongoose.model('businessLicense', businessLicenseSchema);