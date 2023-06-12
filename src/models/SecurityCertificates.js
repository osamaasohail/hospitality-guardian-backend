const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const securityCerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    },
    certId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true });
module.exports = mongoose.model('SecurityCertificates', securityCerSchema);