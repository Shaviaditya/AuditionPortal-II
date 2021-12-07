const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');
const roundmodel = require('../models/roundmodel');
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
    const authPass = passport.authenticate("jwt",
        {
            session: false
        }
    );


    app.put(
        "/protected/changerole",
        authPass,
        async (req, res) => {
            if (req.user.role === "su") {
                console.log(req.user);
                var role = req.body.role;
                const userDetails = await users.getUserById(req.body)
                userDetails.role = role;
                await userDetails.save();
                const details = await dashmodel.findOne({ where: { uuid: req.body.uuid } });
                details.role = role;
                details.save();
                console.log(dash)
                if (eventlogger(req.user, `changed the role for ${details.name} to ${role}`))
                    res.sendStatus(201).json({ success: "true" });
                else
                    res.sendStatus(500).json({ success: "false" });
            } else {
                res.sendStatus(401).json({ success: "failed" });;
            }
        }
    );

    app.put(
        "/protected/setclearance", authPass,
        async (req, res) => {
            try {
                if (req.user.role === "su") {
                    var id = req.body.uuid;
                    var clearance = req.body.clearance
                    const details = await users.getUserById(req.body);
                    details.clearance = clearance;
                    details.save();
                    if (eventlogger(req.user, `Set Clearance for ${details.username} to ${clearance}`))
                        res.sendStatus(202);
                    else
                        res.sendStatus(500)
                } else {
                    res.sendStatus(401);
                }
            } catch (err) {
                console.log(err);
                return res.sendStatus(401);
            }
        }
    )

    app.post(
        "/protected/pushround", authPass,
        async (req, res) => {
            if (req.user.role === "su") {
                let save = JSON.parse(
                    fs.readFileSync(
                        path.resolve(__dirname + "../../../config/auditionConfig.json"),
                    )
                );
                save.round = save.round + 1;
                save.status = "ong";
                await roundmodel.findOne({ where: { roundNo: save.round } }).then((doc) => {
                    if (!doc) {
                        req.sendStatus(400);
                    } else {
                        save.time = doc.time;
                        if (eventlogger(req.user, `Pushed Round ${save.round}`)) {
                            save = JSON.stringify(save);
                            fs.writeFileSync(
                                path.resolve(__dirname + "../../../config/auditionConfig.json"),
                                save
                            );
                            res.sendStatus(200);
                        } else {
                            res.sendStatus(500)
                        }
                    }
                })
            } else {
                res.sendStatus(401);
            }
        }
    )


};