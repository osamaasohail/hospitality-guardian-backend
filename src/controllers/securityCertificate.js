const { default: mongoose } = require("mongoose");
const BusinessLicense = require("../models/BusinessLicense");
const SecurityCertificates = require("../models/SecurityCertificates");
const Subscription = require("../models/Subscription");
// const stripe = require("stripe")(
//   "sk_test_51Ml5u1B46Hybyi0DScxDrKlLM4qbLwekHUYEXRrmssqwhxS66rVFBGDSgYuU5GK5BBGBD3yHBfLZw27Q7NADMYV400ZlIIfSC3"
// );
const stripe = require("stripe")(
  "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"
);

module.exports = {
  get: async (req, res) => {
    SecurityCertificates.find({ certId: req.params.certId })
      .then((docs) => {
        res.status(201).json({ SecurityCertificate: docs });
      })
      .catch((err) => {
        res.status(500).json({ error: "Internal server error" });
      });
  },
  getOne: async (req, res) => {
    SecurityCertificates.findOne({
      certId: req.params.certId,
      _id: req.params.scId,
    })
      .then((docs) => {
        res.status(201).json({ securityCertificate: docs });
      })
      .catch((err) => {
        res.status(500).json({ error: "Internal server error" });
      });
  },
  add: async (req, res) => {
    try {
      const objectId = new mongoose.Types.ObjectId();
      let securityCertificate = {
        _id: objectId,
        name: req.body.name,
        email: req.body.email,
        licenseNumber: req.body.licenseNumber,
        expiryDate: new Date(req.body.expiryDate),
        isActive: true,
        certId: req.params.certId,
      };
      let businessLicenses = await BusinessLicense.findOne({
        _id: req.params.certId,
      });
      let subscription = await Subscription.findOne({ refUser: req.user._id });
      if (subscription) {
        const filteredItems = subscription?.subscriptionItems?.filter(
          (item) => item.isSecurityCertificate === true
        );
        const totalQuantity = filteredItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        if (filteredItems.length > 0) {
          const subscriptionIdForSecurityCertificate = filteredItems[0]?.id;
          const updateSubscription = await stripe.subscriptions.update(
            subscription.subscriptionId,
            {
              items: [
                {
                  id: subscriptionIdForSecurityCertificate,
                  quantity: totalQuantity + 1,
                },
              ],
            }
          );
          const index = subscription.subscriptionItems.findIndex(
            (item) => item.id === subscriptionIdForSecurityCertificate
          );
          console.log("Index ", index);
          subscription.subscriptionItems[index].quantity = totalQuantity + 1;
          console.log("Subscription ", subscription.subscriptionItems);
          await subscription.save();
          console.log("Subscription saved");
        }
        // console.log("totalQuantity", totalQuantity, filteredItems);
        // return res.status(201).json({ message: "Security Certificate Added", totalQuantity, filteredItems });
      }
      // return res.status(201).json({ message: "Security Certificate Added" });
      businessLicenses.securityCertificates.push(objectId);
      businessLicenses.expiryDate = new Date(businessLicenses.expiryDate);
      await businessLicenses.save();
      const doc = new SecurityCertificates(securityCertificate);
      await doc.save();
      res
        .status(201)
        .json({ message: "Security Certificate Added", objectId: objectId });
    } catch (err) {
      console.log("Error is ", err);
      res.status(500).json({ error: err, message: "Internal server error" });
    }
    //   res.status(201).json({ message: "Security Certificate Added" });
    // } catch (err) {
    //   res.status(500).json({ error: err, message: "Internal server error" });
    // }
  },
  update: async (req, res) => {
    SecurityCertificates.updateOne({ _id: req.params.scId }, { $set: req.body })
      .then((updatedDocument) => {
        res.status(201).json({ doc: updatedDocument });
      })
      .catch((err) => {
        res.status(500).json({ error: err, message: "Internal server error" });
      });
  },
  delete: async (req, res) => {
    SecurityCertificates.updateOne(
      { _id: req.params.scId },
      { $set: { isActive: false } },
      { new: true }
    )
      .then(async (updatedDocument) => {
        let subscription = await Subscription.findOne({
          refUser: req.user._id,
        });
        if (subscription) {
          const filteredItems = subscription?.subscriptionItems?.filter(
            (item) => item.isSecurityCertificate === true
          );
          const totalQuantity = filteredItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          if (filteredItems.length > 0) {
            const subscriptionIdForSecurityCertificate = filteredItems[0]?.id;
            await stripe.subscriptions.update(subscription.subscriptionId, {
              items: [
                {
                  id: subscriptionIdForSecurityCertificate,
                  quantity: totalQuantity - 1,
                },
              ],
            });
            const index = subscription.subscriptionItems.findIndex(
              (item) => item.id === subscriptionIdForSecurityCertificate
            );
            subscription.subscriptionItems[index].quantity = totalQuantity - 1;
            await subscription.save();
          }
          res.status(201).json({ doc: updatedDocument });
          // console.log("totalQuantity", totalQuantity, filteredItems);
          // return res.status(201).json({ message: "Security Certificate Added", totalQuantity, filteredItems });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err, message: "Internal server error" });
      });
  },
};
