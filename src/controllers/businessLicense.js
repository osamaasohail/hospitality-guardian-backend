const BusinessLicense = require("../models/BusinessLicense");
const DutyManagers = require("../models/DutyManagers");
const SecurityCertificates = require("../models/SecurityCertificates");
const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
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
      const businessLicense = {
        _id: objectId,
        refUser: req.user._id,
        name: req.body.name,
        role: req.body.role,
        licenseNumber: req.body.licenseNumber,
        expiryDate: new Date(req.body.expiryDate),
        gamingLicense: req.body.gamingLicense,
        gamingLicenseExpiry: req.body.gamingLicenseExpiry,
        sendNotiBeforeExpiry: req.body.sendNotiBeforeExpiry,
        isGamingLicenseEnabled: req.body.isGamingLicenseEnabled,
        dutyManagers: [],
        securityCertificates: [],
        isActive: true,
        isBusinessLicensePaid: false,
      };
      let dutyManagers = req.body.dutyManagers;
      dutyManagers = dutyManagers.map((doc) => {
        return {
          ...doc,
          _id: new mongoose.Types.ObjectId(),
          isActive: true,
          certId: objectId,
        };
      });
      let securityCertificates = req.body.securityCertificates;
      securityCertificates = securityCertificates.map((doc) => {
        return {
          ...doc,
          _id: new mongoose.Types.ObjectId(),
          isActive: true,
          certId: objectId,
        };
      });


      const dutyManagerIds = dutyManagers.reduce(
        (accumulator, currentValue) => {
          accumulator.push(currentValue._id);
          return accumulator;
        },
        []
      );

      const securityCertificatesIds = securityCertificates.reduce(
        (accumulator, currentValue) => {
          accumulator.push(currentValue._id);
          return accumulator;
        },
        []
      );

      businessLicense.dutyManagers = dutyManagerIds;
      businessLicense.securityCertificates = securityCertificatesIds;
      const doc = new BusinessLicense(businessLicense);
      var lineItems1;
     
      await DutyManagers.insertMany(dutyManagers)
        .then(async (docs) => {
          return doc.save();
        })
        .then(async (d) => {
          lineItems1 = [
            {
              price: process.env.DUTY_MANAGER_PRODUCT_PRICE_ID,
              quantity: req.body.quantity,
            },
          ];
          });


          await SecurityCertificates.insertMany(securityCertificates)
        .then(async (docs) => {
          return doc.save();
        })
        .then(async (d) => {
          lineItems1.push(
            {
              price: process.env.Security_Certificate_PRODUCT_PRICE_ID,
              quantity: req.body.quantity,
            },
          );

          if (req.body.isGamingLicenseEnabled) {
            lineItems1.push({
              price: process.env.GAMING_PRODUCT_PRICE_ID,
              quantity: 1,
            });

        }
          const session = await stripe.checkout.sessions.create({
            success_url: `${process.env.FRONTEND_URL}/profile/edit-profile`,
            line_items: lineItems1,
            mode: "subscription",
            metadata: {
              userId: req.user._id,
              type: "businessLicense",
              quantity: req.body.quantity,
              isNew: true,
            },
          });

          res.status(201).json({
            message: "Business License Added Succesfully",
            url: session.url,
          });
          
        })
        .catch((err) => {
          throw new Error(err);
          res.status(500).json({ error: "Internal server error" });
        });


        


    } catch (err) {
      console.log(err);
      console.log("lol");
      res.status(500).json({ error: err });
    }
  },



  get: async (req, res) => {
    BusinessLicense.find({ refUser: req.user._id, isActive: true })
      .populate({
        path: "dutyManagers",
        match: { isActive: true },
      })
      .populate({
        path: "securityCertificates",
        match: { isActive: true },
      })
      .then((docs) => {
        res.status(201).json({ licenses: docs });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err, message: "Internal server error" });
      });
  },
  getAll: async (req, res) => {
    BusinessLicense.find({ isActive: true })
      .populate({
        path: "dutyManagers",
        match: { isActive: true },
      })
      .populate({
        path: "securityCertificates",
        match: { isActive: true },
      })
      .then((docs) => {
        res.status(201).json({ licenses: docs });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err, message: "Internal server error" });
      });
  },
  update: async (req, res) => {
    BusinessLicense.updateOne(
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
    await BusinessLicense.updateOne(
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
      .then((docs) => {
        return SecurityCertificates.updateMany(
          { certId: req.params.id },
          { $set: { isActive: false } },
          { new: true }
        );
      })
      .then((d) => {
        res
          .status(201)
          .json({ message: "Business License Deleted Succesfully" });
      })
      .catch((err) => {
        res.status(500).json({ error: "Internal server error" });
      });
  },
  deleteGamingLicense: async (req, res) => {
    BusinessLicense.updateOne(
      { refUser: req.user._id },
      { $set: {isGamingLicenseEnabled: false} },
      { new: true }
    )
      .then(async (updatedDocument) => {
        let subscription = await Subscription.findOne({ refUser: req.user._id });
        if (subscription) {
          const filteredItems = subscription?.subscriptionItems?.filter(
            (item) => item.isGamingLicense === true
          );
          if (filteredItems.length > 0) {
            const subscriptionIdGamingLicense = filteredItems[0]?.id;
            const updateSubscription = await stripe.subscriptions.update(
              subscription.subscriptionId,
              {
                items: [
                  {
                    id: subscriptionIdGamingLicense,
                    quantity: 0,
                  },
                ],
              }
            );
            const index = subscription.subscriptionItems.findIndex(
              (item) => item.id === subscriptionIdGamingLicense
            );
            console.log("Index ", index);
            subscription.subscriptionItems[index].quantity = 0;
            console.log("Subscription ", subscription.subscriptionItems);
            await subscription.save();
            console.log("Subscription saved");
          }
          // console.log("totalQuantity", totalQuantity, filteredItems);
          // return res.status(201).json({ message: "Duty Manager Added", totalQuantity, filteredItems });
        }
        res.status(201).json({ doc: updatedDocument });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err, message: "Internal server error" });
      });
  },
  addGamingLicense: async (req, res) => {
    BusinessLicense.updateOne(
      { refUser: req.user._id },
      { $set: req.body },
      { new: true }
    )
      .then(async (updatedDocument) => {
        // let subscription = await Subscription.findOne({ refUser: req.user._id });
        // if (subscription) {
        //   const filteredItems = subscription?.subscriptionItems?.filter(
        //     (item) => item.isGamingLicense === true
        //   );
        //   if (filteredItems.length > 0) {
        //     const subscriptionIdGamingLicense = filteredItems[0]?.id;
        //     const updateSubscription = await stripe.subscriptions.update(
        //       subscription.subscriptionId,
        //       {
        //         items: [
        //           {
        //             id: subscriptionIdGamingLicense,
        //             quantity: 1,
        //           },
        //         ],
        //       }
        //     );
        //     const index = subscription.subscriptionItems.findIndex(
        //       (item) => item.id === subscriptionIdGamingLicense
        //     );
        //     console.log("Index ", index);
        //     subscription.subscriptionItems[index].quantity = 1;
        //     console.log("Subscription ", subscription.subscriptionItems);
        //     await subscription.save();
        //     console.log("Subscription saved");
        //   }
        // }
        res.status(201).json({ doc: updatedDocument });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err, message: "Internal server error" });
      });
  }
};
