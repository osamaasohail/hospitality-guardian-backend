const { default: mongoose } = require("mongoose");
const notifications = require("../models/notifications");
module.exports = {
    get: async(req, res) => {
        notifications.find({refUser: req.user._id})
        .then(docs => {
            res.status(201).json({notifications: docs});
        })
        .catch(err => {
            res.status(500).json({ error: "Internal server error" });
        });
    },
}