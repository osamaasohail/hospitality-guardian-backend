const cron = require("node-cron");
const IndividualLicense = require("../models/IndividualLicense");
const BusinessLicense = require("../models/BusinessLicense");
const fs = require("fs");
const handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const notificationsSchema = require("../models/notifications");
// cron.schedule("0 */12 * * *", async () => {
  // for business licenses
cron.schedule('*/15 * * * * *', async () => {
  console.log("for business licenses");
  let licenses = await BusinessLicense.find().populate("refUser").populate('dutyManagers');
  console.log(licenses);
  licenses.forEach(async (license) => {
    let expiryDate = new Date(license.expiryDate).getTime();
    for (let i = 0; i < license.sendNotiBeforeExpiry.length; i++) {
      let dateLicense = new Date();
      dateLicense.setDate(dateLicense.getDate() + license.sendNotiBeforeExpiry[i]);
      if (dateLicense.getTime() > expiryDate) {
        let notification = await notificationsSchema.find({
          refUser: license.refUser._id,
          businessLicense: license._id,
          sendNotiDay: license.sendNotiBeforeExpiry[i],
        });
        if (notification.length === 0) {
          console.log(license);
          const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASSWORD
              }
          });
          const source = fs.readFileSync(
            "src/templates/email-template-license.html",
            "utf8"
          );
          const template = handlebars.compile(source);
          let myDate = new Date();
          const diffInMilliseconds = Math.abs(expiryDate - myDate.getTime()); // get the difference in milliseconds
          const diffInDays = Math.floor(
            diffInMilliseconds / (24 * 60 * 60 * 1000)
          );
          const mailOptions = {
            from: process.env.EMAIL,
            to: license.refUser.email,
            subject: "Subscription Renewal",
            html: template({
              name: license.refUser.name,
              licenseName: license.name,
              xDays: diffInDays,
            }),
            attachments: [
              {
                filename: "logo.png",
                path: "src/templates/Email-Template.png",
                cid: "unique@logo.png",
              },
            ],
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
          const notifications = {
            name: "License Expiry Notification",
            createdBy: "System",
            refUser: license.refUser._id,
            businessLicense: license._id,
            sendNotiDay: license.sendNotiBeforeExpiry[i],
          };
          const doc = new notificationsSchema(notifications);
          await doc.save();
        }
      }
      license.dutyManagers.forEach(async (dMs) => {
        let expiryDateDm = new Date(dMs.expiryDate).getTime();
        if (dateLicense.getTime() > expiryDateDm) {
          let notification = await notificationsSchema.find({
            refUser: dMs._id,
            businessLicense: license._id,
            sendNotiDay: license.sendNotiBeforeExpiry[i],
          });
          if (notification.length === 0) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });
            const source = fs.readFileSync(
              "src/templates/email-template-license.html",
              "utf8"
            );
            const template = handlebars.compile(source);
            let myDate = new Date();
            const diffInMilliseconds = Math.abs(expiryDateDm - myDate.getTime()); // get the difference in milliseconds
            const diffInDays = Math.floor(
              diffInMilliseconds / (24 * 60 * 60 * 1000)
            );
            const mailOptions = {
              from: process.env.EMAIL,
              to: `${dMs.email},${license.refUser.email}`,
              subject: "Subscription Renewal",
              html: template({
                name: dMs.name,
                licenseName: license.name,
                xDays: diffInDays,
              }),
              attachments: [
                {
                  filename: "logo.png",
                  path: "src/templates/Email-Template.png",
                  cid: "unique@logo.png",
                },
              ],
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });
            const notifications = {
              name: "License Expiry Notification For Duty Manager",
              createdBy: "System",
              refUser: dMs._id,
              businessLicense: license._id,
              sendNotiDay: license.sendNotiBeforeExpiry[i],
            };
            const doc = new notificationsSchema(notifications);
            await doc.save();
          }
        }
      });
    }
  });
});
cron.schedule('*/5 * * * * *', async () => {
// cron.schedule("0 */12 * * *", async () => {
  // for individual licenses
  console.log("for individual licenses");
  let licenses = await IndividualLicense.find()
    .populate("refUser")
    .populate("dutyManager");
  console.log("IND Licnese : ", licenses);
  licenses.forEach(async (license) => {
    let expiryDate = new Date(license.dutyManager.expiryDate).getTime();
    for (let i = 0; i < license.sendNotiBeforeExpiry.length; i++) {
      let date = new Date();
      date.setDate(date.getDate() + license.sendNotiBeforeExpiry[i]);
      if (date.getTime() > expiryDate) {
        let notification = await notificationsSchema.find({
          refUser: license.refUser._id,
          individualLicense: license._id,
          sendNotiDay: license.sendNotiBeforeExpiry[i],
        });
        if (notification.length === 0) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
            },
          });
          const source = fs.readFileSync(
            "src/templates/email-template-license.html",
            "utf8"
          );
          const template = handlebars.compile(source);
          let myDate = new Date();
          const diffInMilliseconds = Math.abs(expiryDate - myDate.getTime()); // get the difference in milliseconds
          const diffInDays = Math.floor(
            diffInMilliseconds / (24 * 60 * 60 * 1000)
          );
          const mailOptions = {
            from: process.env.EMAIL,
            to: license.refUser.email,
            subject: "Subscription Renewal",
            html: template({
              name: license.refUser.name,
              licenseName: license.name,
              xDays: diffInDays,
            }),
            attachments: [
              {
                filename: "logo.png",
                path: "src/templates/Email-Template.png",
                cid: "unique@logo.png",
              },
            ],
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
          const notifications = {
            name: "License Expiry Notification",
            createdBy: "System",
            refUser: license.refUser._id,
            individualLicense: license._id,
            sendNotiDay: license.sendNotiBeforeExpiry[i],
          };
          const doc = new notificationsSchema(notifications);
          await doc.save();
        }
      }
    }
  });
});
