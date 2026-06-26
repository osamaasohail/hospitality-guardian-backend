require("dotenv").config();
var createError = require("http-errors");
const fs = require("fs");
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
var configDB = require("./src/config/db");
const nodemailer = require("nodemailer");

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});
const https = require("https");
//Certificate
const privateKey = fs.readFileSync(
  "/home/ubuntu/proj/backend/private.key",
  "utf8"
);
const certificate = fs.readFileSync(
  "/home/ubuntu/proj/backend/certificate.crt",
  "utf8"
);
const ca = fs.readFileSync("/home/ubuntu/proj/backend/ca_bundle.crt", "utf8");

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};
app.use(logger("dev"));
app.use(express.json());
const port = process.env.PORT || "3000";
app.use(express.urlencoded({ extended: false }));
const connectWithRetry = () => {
  mongoose
    .connect(configDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Connected to the database");
    })
    .catch((err) => {
      console.error("Database connection error:", err);
      setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    });
};

connectWithRetry();
app.use(cors());
app.use(express.static(__dirname, { dotfiles: "allow" }));
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.get("/", function (req, res) {
  try {
    res.status(200).json({ message: "Sucess" });
  } catch (error) {
    console.log(error);
  }
});
require("./src/routes/auth")(app);
require("./src/routes/business-licenses")(app);
require("./src/routes/dutyManager")(app);
require("./src/routes/securityCertificate")(app);
require("./src/routes/individual-licenses")(app);
require("./src/routes/stripe")(app);
require("./src/services/notifications");
require("./src/routes/notificationRoute")(app);
app.get("/testing-server", function (req, res) {
  return res.status(200).json({
    message: "Server is working",
    frontendurl: process.env.FRONTEND_URL,
    dutyManagerPriceId: process.env.DUTY_MANAGER_PRODUCT_PRICE_ID,
    securityCertificatePriceId:
      process.env.Security_Certificate_PRODUCT_PRICE_ID,
    businessLicensePriceId: process.env.BUSINESS_PRODUCT_PRICE_ID,
  });
});
app.use((req, res, next) => {
  next(createError(404));
});

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(4000, () => {
  console.log("HTTPS Server running on port 443");
});
