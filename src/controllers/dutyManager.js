const DutyManagers = require('../models/DutyManagers');
module.exports = {
    get: async(req, res) => {
        DutyManagers.find({certId: req.params.certId})
        .then(docs => {
            res.status(201).json({dutyManagers: docs});
        })
        .catch(err => {
            res.status(500).json({ error: "Internal server error" });
        });
    },
    getOne: async (req, res) => {
        DutyManagers.findOne({certId: req.params.certId, _id: req.params.dmId})
        .then(docs => {
            res.status(201).json({dutyManager: docs});
        })
        .catch(err => {
            res.status(500).json({ error: "Internal server error" });
        });
    },
    add: async(req, res) => {
        try {
            let dutyManager = {
                name: req.body.name,
                email: req.body.email,
                licenseNumber: req.body.licenseNumber,
                expiryDate: new Date(req.body.expiryDate),
                isActive: true,
                certId: req.params.certId
            };
            const doc = new DutyManagers(dutyManager);
            await doc.save();
            res.status(201).json({message: 'Duty Manager Added'});
        } catch (err) {
            res.status(500).json({ error: err, message: "Internal server error" });
        }
    },
    update: async(req, res) => {
        DutyManagers.updateOne({ _id: req.params.dmId }, {$set: req.body })
        .then(updatedDocument => {
            res.status(201).json({doc: updatedDocument});
        })
        .catch(err => {
            res.status(500).json({ error: err, message: "Internal server error" });
        });
    },
    delete: async(req, res) => {
        DutyManagers.updateOne({ _id: req.params.dmId }, { $set: { isActive: false } }, { new: true })
            .then(updatedDocument => {
                res.status(201).json({doc: updatedDocument});
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: err, message: "Internal server error" });
        });
    }

}