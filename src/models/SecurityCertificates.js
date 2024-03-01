const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const securityCerSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    licenseNumber: {
      type: String,
      required: false,
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
    },
    certId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("SecurityCertificates", securityCerSchema);
