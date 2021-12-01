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
                await users.save().then(() => {
                    const details = await dashmodel.findOne({ where: { uuid: req.body.uuid } });
                    details.role = role;
                    dashmodel.save().then((dash) => {
                        console.log(dash)
                        if (eventlogger(req.user, `changed the role for ${dash.name} to ${role}`))
                            res.sendStatus(202)
                        else
                            res.sendStatus(500)
                    })

                })
            } else {
                res.sendStatus(401);
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
                    users.save().then(() => {
                        if (eventlogger(req.user, `Set Clearance for ${users.username} to ${clearance}`))
                            res.sendStatus(202);
                        else
                            res.sendStatus(500)
                    })
                } else {
                    res.sendStatus(401);
                }
            } catch (err) {
                console.log(err);
                return res.sendStatus(401);
            }
        }
    )

    
};