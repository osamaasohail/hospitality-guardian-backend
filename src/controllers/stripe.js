const express = require("express");
const router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51K6TTUFJlvwC7pufNo15hNsO02Wa5VrTCaTSi7trrXHw2ju5T8RGLCrQUQI4RQ3sewOMTN4ENyizBeRDkafCVEe700RCDvZkzj"
);
const endpointSecret = "whsec_R4BfBt102fRADUVgIo6s3UOy0UqmCG6e";
const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
const DutyManagers = require("../models/DutyManagers");
const User = require("../models/User");

module.exports = {
  session: async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        success_url: "http://localhost:3000/profile/edit-profile",
        line_items: [
          {
            price: "price_1MxytJFJlvwC7pufBIhIxwDL",
            quantity: req.body.quantity,
          },
        ],
        mode: "subscription",
        metadata: {
          user_id: req.user._id,
        },
      });
      res.json({ url: session.url });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  webhook: async (req, res) => {
    let event = req.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    // if (endpointSecret) {
    //   // Get the signature sent by Stripe
    //   const signature = req.headers["stripe-signature"];
    //   console.log("Signature", signature)
    //   try {
    //     event = stripe.webhooks.constructEvent(
    //       req.body,
    //       signature,
    //       endpointSecret
    //     );
    //   } catch (err) {
    //     console.log(`⚠️  Webhook signature verification failed.`, err.message);
    //     return res.sendStatus(400);
    //   }
    // }
    // Handle the event
    switch (event.type) {
      case "invoice.paid":
        const invoicePaid = event.data.object;
        console.log(`Invoice paid`, invoicePaid);
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "checkout.session.async_payment_succeeded":
        const checkoutPaymentSucceeded = event.data.object;
        console.log(
          "checkout.session.async_payment_succeeded",
          checkoutPaymentSucceeded
        );
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "checkout.session.completed":
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const paymentAmount = session.amount_total;
        const metadata = session.metadata;
        try {
          const objectId = new mongoose.Types.ObjectId();
          const subscriptionData = {
            _id: objectId,
            refUser: metadata.userId,
            type: metadata.type,
            quantity: metadata.quantity,
            isNew: metadata.isNew,
            isActive: true,
            customerId: customerId,
            subscriptionId: subscriptionId,
            paymentAmount: paymentAmount / 100,
          };
          console.log("subscription", subscriptionData);
          console.log("Subscription model", Subscription);
          const newSubscription = new Subscription(subscriptionData);
          newSubscription
            .save()
            .then((savedSubscription) => {
              User.updateOne(
                { _id: metadata.userId },
                { isProfileCompleted: true }
              )
                .then((updatedDocument) => {
                  console.log("User updated successfully ", updatedDocument)
                  // res.status(201).json({ doc: updatedDocument });
                })
                .catch((err) => {
                  res
                    .status(500)
                    .json({ error: err, message: "Internal server error" });
                });
              return res.status(200).json({
                message: "Subscription saved successfully",
                subscription: savedSubscription,
              });
            })
            .catch((error) => {
              return res.status(400).json({
                message: "Error in saving subscription",
                error: error,
              });
            });
        } catch (err) {
          console.log(
            "Error in stripe webhook checkout session completed",
            err
          );
        }
        break;
      case "plan.created":
        const planCreated = event.data.object;
        console.log("planCreated", planCreated);
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "plan.updated":
        const planUpdated = event.data.object;
        console.log("planUpdated", planUpdated);
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 res to acknowledge receipt of the event
    res.send();
  },
};
