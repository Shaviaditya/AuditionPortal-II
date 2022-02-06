// Tested all routes 
// const worker_connect = require('./controller')
const { sequelize } = require('../models');
const { eventlogger } = require('./eventLogger');
const fs = require('fs')
// const question_answered_model = require('../models/question_answered_model');
require('dotenv').config();
const {
    models:
    {
        users,
        question_answered_model
    }
} = sequelize;
module.exports = (app, passport) => {
    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);

    const authPass = passport.authenticate("jwt", { session: false });
    app.post("/protected/getUser", authPass, async (req, res) => {
        console.log(req.user);
        if (req.user.role === "m" || req.user.role === "su") {
            try {
                let userArr = [];
                // Eager Loading not working so applied Lazy Loading based on Promises
                await users.findAll({ where : { uuid: req.body.uuid }}).then(async (d1) => {
                    await Promise.all(d1.map(async e => {
                        await question_answered_model.findAll({ where: { userUuid: e.uuid}}).then((data) => {
                            return userArr.push([e,{"responses":data}]);
                        }) 
                    }))
                })
                return res.status(200).json({ data: userArr, user: req.user.username });
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

    app.get("/protected/getUsers", authPass, async (req, res) => {
        if (req.user.role === "m" || req.user.role === "su") {
            try {
                let userArr = [];
                // Eager Loading not working so applied Lazy Loading based on Promises
                await users.findAll().then(async (d1) => {
                    await Promise.all(d1.map(async e => {
                        if(e.role==='s'){
                            await question_answered_model.findAll({ where: { userUuid: e.uuid}}).then((data) => {
                                return userArr.push([e,{"responses":data}]);
                            })
                        } else {
                            return userArr.push([e]);
                        } 
                    }))
                })
                return res.status(200).json({ data: userArr, user: req.user.username });
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
                entry.save().then(async () => {
                    // const w1 = worker_connect.get();
                    if (await eventlogger(req.user, `Changed selection status for ${a.username} to ${a.status}`))
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
            if (req.user.role === "su" || (req.user.role === "m")) {
                const entry = await users.findOne({ where: { uuid: req.body.uuid } })
                if (entry.feedback === null) {
                    let arr = []
                    let obj = {
                        "username":req.body.username,
                        "feedback":req.body.feedback,
                        "round":req.body.round
                    }
                    arr.push(obj);
                    entry.feedback = arr;
                } else {
                    let arr = []
                    entry.feedback.forEach(el => {
                        arr.push(el)
                    })
                    let obj = {
                        "username":req.body.username,
                        "feedback":req.body.feedback,
                        "round":req.body.round
                    }
                    arr.push(obj)
                    entry.feedback = arr
                }
                // console.log(entry.feedback);
                entry.save().then(async () => {
                    // const w2 = worker_connect.get();
                    if (await eventlogger(req.user, `Added feedback for ${req.body.username}`))
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
