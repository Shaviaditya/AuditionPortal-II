const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
require('dotenv').config();
const {
    models:
    {
        users,
        roundmodel,
    }
} = sequelize;
module.exports = (app, passport) => {
    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);
    const authPass = passport.authenticate("jwt",
        {
            session: false
        }
    );
    app.get("/profile", authPass, async (req, res) => {
        if (req.user.role === "s") {
            await users.findOne({ where: { uuid: req.user.uuid } }).then(doc => {
                res.status(200).json({ phone: doc.phone, roll: doc.roll, profilebool: doc.profilebool })
            })
        }
    })

    app.get("/auditionstatus", (req, res) => {
        res.sendFile(path.join(__dirname + "../../config/auditionConfig.json"));
    });

    // Beta Testing Route
    app.put('/upgrade/:id', authPass, async (req, res) => {
        let id = req.params.id
        if (req.user.role === "su") {
            users.findOne({
                where: {
                    uuid: id
                }
            }).then((doc) => {
                doc.round = 1
                doc.save();
                res.sendStatus(201)
            })
        }
    })
    app.put('/reject/:id', authPass, async (req, res) => {
        let id = req.params.id
        if (req.user.role === "su") {
            users.findOne({
                where: {
                    uuid: id
                }
            }).then((doc) => {
                doc.status = "rejected"
                doc.save();
                res.sendStatus(201)
            })
        }
    })
};