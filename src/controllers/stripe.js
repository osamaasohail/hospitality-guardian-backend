const express = require("express");
const router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51K6TTUFJlvwC7pufNo15hNsO02Wa5VrTCaTSi7trrXHw2ju5T8RGLCrQUQI4RQ3sewOMTN4ENyizBeRDkafCVEe700RCDvZkzj"
);
const endpointSecret =
  "whsec_R4BfBt102fRADUVgIo6s3UOy0UqmCG6e";

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
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
      }
    }

    invoice.paid

cancel
checkout.session.async_payment_succeeded

cancel
checkout.session.completed

cancel
plan.created

cancel
plan.deleted

cancel
plan.updated
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
        console.log("checkout.session.async_payment_succeeded", checkoutPaymentSucceeded)
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        console.log("checkoutSessionCompleted", checkoutSessionCompleted)
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "plan.created":
        const planCreated = event.data.object;
        console.log("planCreated", planCreated)
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "plan.updated":
        const planUpdated = event.data.object;
        console.log("planUpdated", planUpdated)
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
