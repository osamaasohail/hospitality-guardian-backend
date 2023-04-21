const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const certificateSchema = new Schema({
  refUser: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
  dutyManagers: [{type: mongoose.Schema.Types.ObjectId, ref: 'DutyManagers'}],
  name: { type: String, required: true },
  role: { type: Number, required: true }, // type: 1 for individual, type: 2 for business
  licenseNumber: { type: String, required: true },
  expiryDate: { type: Date, default: false },
  gamingLicense: { type: String},
  gamingLicenseExpiry: {type: Date},
  sendNotiBeforeExpiry: {type: Number}, // in days
  isActive: {type: Boolean}
}, { timestamps: true });
module.exports = mongoose.model('Certificate', certificateSchema);