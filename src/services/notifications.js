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
          type: 'BL',
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
          const diffInMilliseconds = Math.abs(expiryDate - myDate.getTime()); // get the difference in milliseconds
          const diffInDays = Math.floor(
            diffInMilliseconds / (24 * 60 * 60 * 1000)
          );
          let templateDay = '';
          if (diffInDays > 1) {
            templateDay = `in ${diffInDays} days`;
          }
          if (diffInDays === 1) {
            templateDay = `tomorrow`;
          }
          if (diffInDays === 0) {
            templateDay = `today`;
          }
          const mailOptions = {
            from: {
              name: 'The Hospitality Guardian',
              address: process.env.EMAIL
            },
            to: license.refUser.email,
            subject: "Subscription Renewal",
            html: template({
              licenseType: 'Liquor License',
              name: license.refUser.name,
              licenseNumber: license.licenseNumber,
              xDays: templateDay,
            }),
            attachments: [
              {
                filename: "logo.png",
                path: "src/templates/Email-Template.png",
                cid: "unique@logo.png",
              },
            ],
          };
          await transporter.sendMail(mailOptions);
          const notifications = {
            name: "License Expiry Notification ",
            createdBy: "System",
            refUser: license.refUser._id,
            type: 'BL',
            licenseNumber: license.licenseNumber,
            businessLicense: license._id,
            expiryDate: license.expiryDate,
            sendNotiDay: license.sendNotiBeforeExpiry[i],
          };
          const doc = new notificationsSchema(notifications);
          await doc.save();
        }
      }
      if (license.isGamingLicenseEnabled) {
        let expiryDateGM = new Date(license.gamingLicenseExpiry).getTime();
        if (dateLicense.getTime() > expiryDateGM) {
          let notification = await notificationsSchema.find({
            refUser: license.refUser._id,
            businessLicense: license._id,
            type: 'GL',
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
          const diffInMilliseconds = Math.abs(expiryDate - myDate.getTime()); // get the difference in milliseconds
          const diffInDays = Math.floor(
            diffInMilliseconds / (24 * 60 * 60 * 1000)
          );
          let templateDay = '';
          if (diffInDays > 1) {
            templateDay = `in ${diffInDays} days`;
          }
          if (diffInDays === 1) {
            templateDay = `tomorrow`;
          }
          if (diffInDays === 0) {
            templateDay = `today`;
          }
          const mailOptions = {
            from: {
              name: 'The Hospitality Guardian',
              address: process.env.EMAIL
            },
            to: license.refUser.email,
            subject: "Subscription Renewal",
            html: template({
              licenseType: 'Gaming License',
              name: license.refUser.name,
              licenseNumber: license.gamingLicense,
              xDays: templateDay,
            }),
            attachments: [
              {
                filename: "logo.png",
                path: "src/templates/Email-Template.png",
                cid: "unique@logo.png",
              },
            ],
          };
          await transporter.sendMail(mailOptions);
          const notifications = {
            name: "License Expiry Notification",
            createdBy: "System",
            refUser: license.refUser._id,
            type: 'GL',
            businessLicense: license._id,
            licenseNumber: license.gamingLicense,
            expiryDate: license.gamingLicenseExpiry,
            sendNotiDay: license.sendNotiBeforeExpiry[i],
          };
          const doc = new notificationsSchema(notifications);
          await doc.save();
          }
        }
      }
      license.dutyManagers.forEach(async (dMs) => {
        let expiryDateDm = new Date(dMs.expiryDate).getTime();
        if (dateLicense.getTime() > expiryDateDm) {
          let notification = await notificationsSchema.find({
            refUser: dMs._id,
            businessLicense: license._id,
            type: 'DM',
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
            let templateDay = '';
            if (diffInDays > 1) {
              templateDay = `in ${diffInDays} days`;
            }
            if (diffInDays === 1) {
              templateDay = `tomorrow`;
            }
            if (diffInDays === 0) {
              templateDay = `today`;
            }
            const mailOptions = {
              from: {
                name: 'The Hospitality Guardian',
                address: process.env.EMAIL
              },
              to: `${dMs.email}`,
              subject: "Subscription Renewal",
              cc: license?.refUser?.email,
              html: template({
                licenseType: 'Duty Manager License',
                name: dMs.name,
                licenseNumber: dMs.licenseNumber,
                xDays: templateDay,
              }),
              attachments: [
                {
                  filename: "logo.png",
                  path: "src/templates/Email-Template.png",
                  cid: "unique@logo.png",
                },
              ],
            };
            await transporter.sendMail(mailOptions);

            const notifications = {
              name: "License Expiry Notification",
              createdBy: "System",
              refUser: dMs._id,
              businessLicense: license._id,
              licenseNumber: dMs.licenseNumber,
              expiryDate: dMs.expiryDate,
              type: 'DM',
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
cron.schedule('*/15 * * * * *', async () => {
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
          type: 'IL',
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
          let templateDay = '';
          if (diffInDays > 1) {
            templateDay = `in ${diffInDays} days`;
          }
          if (diffInDays === 1) {
            templateDay = `tomorrow`;
          }
          if (diffInDays === 0) {
            templateDay = `today`;
          }
          const mailOptions = {
            from: {
              name: 'The Hospitality Guardian',
              address: process.env.EMAIL
            },
            to: license.refUser.email,
            subject: "Subscription Renewal",
            html: template({
              licenseType: 'License',
              name: license.refUser.name,
              licenseNumber: license.dutyManager?.licenseNumber,
              xDays: templateDay,
            }),
            attachments: [
              {
                filename: "logo.png",
                path: "src/templates/Email-Template.png",
                cid: "unique@logo.png",
              },
            ],
          };
          await transporter.sendMail(mailOptions);
          const notifications = {
            name: "License Expiry Notification",
            createdBy: "System",
            refUser: license.refUser._id,
            type: 'IL',
            individualLicense: license._id,
            licenseNumber: license.dutyManager?.licenseNumber,
            expiryDate: license.dutyManager?.expiryDate,
            sendNotiDay: license.sendNotiBeforeExpiry[i],
          };
          const doc = new notificationsSchema(notifications);
          await doc.save();
        }
      }
    }
  });
});
