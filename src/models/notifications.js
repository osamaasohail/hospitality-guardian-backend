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
    refUser: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    businessLicense: { type: mongoose.Schema.Types.ObjectId, ref: 'businessLicense'},
    individualLicense: { type: mongoose.Schema.Types.ObjectId, ref: 'individualLicense'},
    sendNotiDay: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Notifications', notificationsSchema);