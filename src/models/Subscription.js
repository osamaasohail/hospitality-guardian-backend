const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var subscriptionSchema = new Schema(
  {
    refUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: { type: String },
    quantity: { type: Number },
    isNew: { type: Boolean },
    isActive: { type: Boolean },
    customerId: { type: String },
    subscriptionId: { type: String },
    paymentAmount: { type: Number },
  },
  { timestamps: true }
);
const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
