const express = require("express");
const router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51Ml5u1B46Hybyi0DScxDrKlLM4qbLwekHUYEXRrmssqwhxS66rVFBGDSgYuU5GK5BBGBD3yHBfLZw27Q7NADMYV400ZlIIfSC3"
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
        success_url: `${process.env.FRONTEND_URL}/profile/edit-profile`,
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
        automatic_tax: {
          enabled: true,
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
        return res.status(200).json({ message: "Invoice paid" });
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "checkout.session.async_payment_succeeded":
        const checkoutPaymentSucceeded = event.data.object;
        console.log(
          "checkout.session.async_payment_succeeded",
          checkoutPaymentSucceeded
        );
        return res.status(200).json({ message: "Payment succeeded" });

        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "checkout.session.completed":
        console.log("checkout.session.completed");
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const paymentAmount = session.amount_total;
        const metadata = session.metadata;
        const currentSubscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        var subscriptionItems = currentSubscription.items.data;
        var items = [];
        subscriptionItems.forEach(async (item) => {
          var isDutyManager = false;
          var isGamingLicense = false;
          if (process.env.DUTY_MANAGER_PRODUCT_PRICE_ID === item.price.id) {
            isDutyManager = true;
          }
          if(process.env.GAMING_PRODUCT_PRICE_ID === item.price.id) {
            isGamingLicense = true;
          }
          items.push({
            id: item.id,
            quantity: item.quantity,
            isDutyManager: isDutyManager,
            isGamingLicense: isGamingLicense,
          });
        });
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
            expiresAt: new Date(session.expires_at * 1000),
            subscriptionItems: items,
          };
          const newSubscription = new Subscription(subscriptionData);
          const newSubscriptionResponse = await newSubscription.save();
          await User.updateOne(
            { _id: metadata.userId },
            { isProfileCompleted: true }
          );
          console.log("New Subscription", newSubscriptionResponse);
          return res
            .status(200)
            .json({ message: "Subscription saved successfully" });
        } catch (err) {
          console.log(
            "Error in stripe webhook checkout session completed",
            err
          );
          res.status(500).json({ error: "Internal server error" });
        }
        break;
      case "plan.created":
        const planCreated = event.data.object;
        console.log("planCreated", planCreated);
        return res.status(200).json({ message: "Plan created" });
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "plan.updated":
        const planUpdated = event.data.object;
        console.log("planUpdated", planUpdated);
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        return res.status(200).json({ message: "Plan updated" });
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 res to acknowledge receipt of the event
    res.send();
  },
  subscription: async (req, res) => {
    try {
      const getSubscription = await Subscription.findOne({
        refUser: req.user._id,
        isActive: true,
      });
      const subscription = await stripe.subscriptions.retrieve(
        getSubscription?.subscriptionId
      );
      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        subscription: getSubscription?.subscriptionId,
      });
      const totalQuantity = getSubscription?.subscriptionItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return res
        .status(200)
        .json({
          nextInvoicePrice: upcomingInvoice?.amount_due/100,
          nextInvoiceDate: subscription?.current_period_end,
          totalQuantity: totalQuantity,
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  test: async (req, res) => {
    const subscriptionId = "sub_1N7vnvFJlvwC7puf1aK5oZMw";
    const subscription1 = await stripe.subscriptions.retrieve(subscriptionId);
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscriptionId,
    });
    return res.status(200).json({ subscription1, upcomingInvoice });
    var subscriptionItems = subscription1.items.data;
    var items = [];
    subscriptionItems.forEach(async (item) => {
      var isDutyManager = false;
      if (process.env.DUTY_MANAGER_PRODUCT_PRICE_ID === item.price.id) {
        isDutyManager = true;
      }
      items.push({
        id: item.id,
        quantity: item.quantity,
        isDutyManager: isDutyManager,
      });
    });
    return res.status(200).json({ subscription1, items });
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        { id: "si_NtXYYawyiwfbz9", quantity: 3 },
        // { id: "si_NtXYYawyiwfbz9", quantity: 3 },
        // { id: "si_NtXY95BzCS6oKe", quantity: 1 }
      ],
    });
    console.log("subscription", subscription);
    res.status(200).json({ message: "Success", subscription });
    // stripe.subscriptions.retrieve(subscriptionId, function(err, subscription) {
    //   if (err) {
    //     console.error('Error retrieving subscription:', err);
    //     res.status(400).json({ error: "Error retrieving subscription" });
    //     return;
    //   }
    //   console.log('Subscription retrieved:', subscription);

    //   // Update the quantity for the desired product/item
    //   const updatedItems = subscription.items.data.map(item => {
    //     if (item.price.id === process.env.DUTY_MANAGER_PRODUCT_PRICE_ID) {
    //       // Update the quantity for the desired product
    //       return {
    //         price: item.price.id,
    //         quantity: 3
    //       };
    //     }
    //     return item;
    //   });

    //   // Update the subscription with the modified items
    //   stripe.subscriptions.update(subscriptionId, { items: updatedItems }, function(err, updatedSubscription) {
    //     if (err) {
    //       console.error('Error updating subscription:', err);
    //       res.status(400).json({ error: "Error updating subscription", err });
    //       return;
    //     }

    //     console.log('Subscription updated:', updatedSubscription);
    //     res.status(200).json({ subscription: updatedSubscription });
    //   });
    // });
    // stripe.subscriptions.update(
    //   subscriptionId,
    //   {
    //     items: [
    //       {
    //         price: "price_1N4HsVFJlvwC7pufAWMaVGCL",
    //         quantity: 3,
    //       },
    //     ]
    //   },
    //   function (err, subscription) {
    //     if (err) {
    //       console.error("Error updating subscription quantity:", err);
    //       return res.status(400).json({ error: err });
    //     }

    //     console.log("Subscription updated:", subscription);
    //     res.status(200).json({ subscription: subscription });
    //   }
    // );
  },
  sessionTest: async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        success_url: `${process.env.FRONTEND_URL}/profile/edit-profile`,
        line_items: [
          {
            price: "price_1NAuYXB46Hybyi0DuS5AIL6r",
            quantity: 1,
          },{
            price: "price_1NAuZiB46Hybyi0D6f0ND3sx",
            quantity: 1,
          },{
            price: "price_1NAuaVB46Hybyi0D5LW4lIvs",
            quantity: 1,
          },
        ],
        mode: "subscription",
        automatic_tax: {
          enabled: true,
        },
      });
      res.json({ url: session.url });
      // const updateSubscription = await stripe.subscriptions.update(
      //   "sub_1NCoEsB46Hybyi0DkJR6wUop",
      //   {
      //     items: [
      //       {
      //         id: "si_NylmL6iY8ByMky",
      //         quantity: 1,
      //       }, {
      //         id: "price_1NAuZiB46Hybyi0D6f0ND3sx",
      //         quantity: 1,
      //       }
      //     ],
      //   }
      // );
      // res.json({ updateSubscription });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  },
};
