// Tested all routes 
const worker_connect = require('./controller')
const { sequelize } = require('../models');
require('dotenv').config();
const {
    models:
    {
        users,
    }
} = sequelize;
const workers = worker_connect.get();
module.exports = (app, passport) => {
    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);

    const authPass = passport.authenticate("jwt", { session: false });
    app.get("/protected/getUsers", authPass, async (req, res) => {
        console.log(req.user);
        if (req.user.role === "m" || req.user.role === "su") {
            try {
                await users.findAll().then((data) => {
                    return res.status(200).json({ data: data, user: req.user.username });
                })
            } catch (e) {
                res.sendStatus(404);
                console.log(e);
            }
        } else {
            try {
                const data = await users.findOne({ where: { uuid: req.user.uuid } });
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
                await users.findOne({ where: { uuid: req.body.uuid } }).then((data) => {
                    return res.status(200).json({ data: data, user: req.user.username });
                })
            } catch (e) {
                res.sendStatus(404);
                console.log(e);
            }
        } else {
            try {
                const data = await users.findOne({ where: { uuid: req.user.uuid } });
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
                const entry = await users.findOne({ where: { uuid: req.body.uuid } })
                entry.status = a.status
                entry.save().then(() => {
                    const w1 = worker_connect.get();
                    if (w1.eventlog(req.user, `Changed selection status for ${a.name} to ${a.status}`))
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
                const entry = await users.findOne({ where: { uuid: req.body.uuid } })
                if (entry.feedback.length == 0) {
                    let arr = []
                    arr.push(req.body.feedback);
                    entry.feedback = arr;
                } else {
                    let arr = [];
                    entry.feedback.forEach(el => {
                        arr.push(el);
                    })
                    arr.push(req.body.feedback);
                    entry.feedback = arr;
                }
                // console.log(entry.feedback);
                entry.save().then(() => {
                    const w2 = worker_connect.get();
                    if (w2.eventlog(req.user, `Added feedback for ${entry.name}`))
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
