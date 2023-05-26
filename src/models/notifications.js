const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    refUser: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    businessLicense: { type: mongoose.Schema.Types.ObjectId, ref: 'businessLicense'},
    dutyManagerId: {type: mongoose.Schema.Types.ObjectId, ref: 'DutyManagers'},
    licenseNumber: { type: String, required: true},
    expiryDate: { type: String, required: true },
    individualLicense: { type: mongoose.Schema.Types.ObjectId, ref: 'individualLicense'},
    sendNotiDay: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Notifications', notificationsSchema);
