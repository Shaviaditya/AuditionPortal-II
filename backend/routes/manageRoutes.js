const { user } = require('pg/lib/defaults');
const eventlogger = require('./eventLogger')
const { sequelize } = require('../models');
require('dotenv').config();
const {
    models:
    {
        users,
        dashmodel
    }
} = sequelize;
module.exports = (app, passport) => {
    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);

    const authPass = passport.authenticate("jwt", { session: false });
    app.get("/protected/getUsers", authPass, async (req, res) => {
        console.log(req.user);
        if (req.user.role === "m" || req.user.role === "su") {
            try {
                await dashmodel.findAll().then((data) => {
                    return res.status(200).json({ data: data, user: req.user.username });
                })
            } catch (e) {
                res.sendStatus(404);
                console.log(e);
            }
        } else {
            try {
                const data = await users.getUserById(req.user);
                data.flag = true;
                data.save();
                return res.status(200).json(data);
            } catch (e) {
                console.log(e);
                return res.status(401);
            }
        }
    })

    app.post("/protected/getUser", authPass, async (req, res) => {
        console.log(req.user);
        if (req.user.role === "m" || req.user.role === "su") {
            try {
                await dashmodel.findOne({ where: { uuid: req.body.uuid } }).then((data) => {
                    return res.status(200).json({ data: data, user: req.user.username });
                })
            } catch (e) {
                res.sendStatus(404);
                console.log(e);
            }
        } else {
            try {
                const data = await users.getUserById(req.user);
                data.flag = true;
                data.save();
                return res.status(200).json(data);
            } catch (e) {
                console.log(e);
                return res.status(401);
            }
        }
    })

    app.put(
        "/protected/update",
        authPass,
        async (req, res) => {
            var a = req.body;
            if (
                req.user.role === "su" ||
                (req.user.role === "m" && req.user.clearance >= a.round)
            ) {
                const entry = await dashmodel.findOne({ where: { uuid: req.body.uuid } })
                entry.status = a.status
                entry.save().then(() => {
                    if (eventlogger(req.user, `Changed selection status for ${a.name} to ${a.status}`))
                        return res.status(202).json({ message: "Changes have been saved" });
                    else
                        res.sendStatus(500).json({ success: "false" });
                })
            } else {
                return res.sendStatus(401).json({ success: "failed" });;
            }
        }
    );

    app.put(
        "/protected/feedback",
        authPass,
        async (req, res) => {
            // var a = req.body;
            if (
                req.user.role === "su" ||
                (req.user.role === "m")
            ) {
                const entry = await dashmodel.findOne({ where: { uuid: req.body.uuid } })
                entry.feedback.push(req.body.feedback);
                entry.save().then(() => {
                    if (eventlogger(req.user, `Added feedback for ${req.body.name}`))
                        return res.status(202).json({ message: "Changes have been saved" });
                    else
                        res.sendStatus(500).json({ success: "false" });
                })
            } else {
                return res.sendStatus(401).json({ success: "failed" });
            }
        }
    );


};
