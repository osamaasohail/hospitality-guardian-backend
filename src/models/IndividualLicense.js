const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const individualLicenseSchema = new Schema({
  refUser: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
  dutyManager: {type: mongoose.Schema.Types.ObjectId, ref: 'DutyManagers'},
  name: { type: String, required: true },
  sendNotiBeforeExpiry: [{type: Number}], // in days
  isActive: {type: Boolean}
}, { timestamps: true });
module.exports = mongoose.model('individualLicense', individualLicenseSchema);