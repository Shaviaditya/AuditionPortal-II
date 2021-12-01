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
    require("./eventLogger")(app)

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
                await users.getUserById(req.user).then((data) => {
                    data.flag = true;
                    return res.status(200);
                })
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
                await users.getUserById(req.user).then((data) => {
                    data.flag = true;
                    return res.status(200);
                })
            } catch (e) {
                console.log(e);
                return res.status(401);
            }
        }
    })

    app.put(
        "/protected/update",
        authPass,
        (req, res) => {
            var a = req.body;
            if (
                req.user.role === "su" ||
                (req.user.role === "m" && req.user.clearance >= a.round)
            ) {
                dashmodel.findOne({where:{ uuid: req.body.uuid}}).then((entry) => {
                    entry.status = a.status
                    entry.save().then(() => {
                        if (eventlogger(req.user, `Changed selection status for ${a.name} to ${a.status}`))
                            return res.status(202).json({ message: "Changes have been saved" });
                        else
                            res.sendStatus(500)
                    })
                })
            } else {
                return res.sendStatus(401);
            }
        }
    );

    app.put(
        "/protected/feedback",
        authPass,
        (req, res) => {
            var a = req.body;
            if (
                req.user.role === "su" ||
                (req.user.role === "m")
            ) {

                dashmodel.findOne({where:{ uuid: req.body.uuid}}).then((entry) => {
                    entry.feedback.push(req.body.feedback);
                    entry.save().then(() => {
                        if (eventlogger(req.user, `Added feedback for ${req.body.name}`))
                            return res.status(202).json({ message: "Changes have been saved" });
                        else
                            res.sendStatus(500)
                    })
                })
            } else {
                return res.sendStatus(401);
            }
        }
    );
};
