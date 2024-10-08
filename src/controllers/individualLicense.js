const IndividualLicense = require("../models/IndividualLicense");
const DutyManagers = require("../models/DutyManagers");
const mongoose = require("mongoose");
// const stripe = require("stripe")(
//   "sk_test_51Ml5u1B46Hybyi0DScxDrKlLM4qbLwekHUYEXRrmssqwhxS66rVFBGDSgYuU5GK5BBGBD3yHBfLZw27Q7NADMYV400ZlIIfSC3"
// );
const stripe = require("stripe")(
  "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"
);
require("dotenv").config();

module.exports = {
  add: async (req, res) => {
    try {
      const objectId = new mongoose.Types.ObjectId();
      const individualLicense = {
        _id: objectId,
        refUser: req.user._id,
        name: req.body.name,
        sendNotiBeforeExpiry: req.body.sendNotiBeforeExpiry,
        dutyManager: {},
        isActive: true,
      };
      let dutyManager = req.body.dutyManager;
      dutyManager._id = new mongoose.Types.ObjectId();
      dutyManager.certId = objectId;
      dutyManager.isActive = true;
      individualLicense.dutyManager = dutyManager._id;
      const doc = new IndividualLicense(individualLicense);
      const docDutyMan = new DutyManagers(dutyManager);
      await docDutyMan
        .save()
        .then(async (docs) => {
          return doc.save();
        })
        .then(async (d) => {
          const session = await stripe.checkout.sessions.create({
            success_url: `${process.env.FRONTEND_URL}/profile/edit-profile`,
            line_items: [
              {
                price: process.env.DUTY_MANAGER_PRODUCT_PRICE_ID,
                quantity: 1,
              },
            ],
            metadata: {
              userId: req.user._id,
              type: "individualLicense",
              quantity: 1,
              isNew: true,
            },
            mode: "subscription",
            automatic_tax: {
              enabled: true,
            },
          });
          res.status(201).json({
            message: "Individual License Added Succesfully",
            url: session.url,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: "Internal server error" });
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  },
  get: async (req, res) => {
    IndividualLicense.find({ refUser: req.user._id, isActive: true })
      .populate({
        path: "dutyManager",
        match: { isActive: true },
      })
      .then((docs) => {
        docs.DutyManagers = docs.dutyManager;
        res.status(201).json({ licenses: docs });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err, message: "Internal server error" });
      });
  },
  update: async (req, res) => {
    IndividualLicense.updateOne(
      { refUser: req.params.id },
      { $set: req.body },
      { new: true }
    )
      .then((updatedDocument) => {
        res.status(201).json({ doc: updatedDocument });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err, message: "Internal server error" });
      });
  },
  delete: async (req, res) => {
    await IndividualLicense.updateOne(
      { _id: req.params.id },
      { $set: { isActive: false } },
      { new: true }
    )
      .then((docs) => {
        return DutyManagers.updateMany(
          { certId: req.params.id },
          { $set: { isActive: false } },
          { new: true }
        );
      })
      .then((d) => {
        res
          .status(201)
          .json({ message: "Individual License Deleted Succesfully" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
      });
  },
};
