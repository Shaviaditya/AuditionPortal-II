const { sequelize, models } = require('../models/index');
const eventlogger = require('./eventLogger');
const fs = require("fs");
const path = require('path');
const { all, Op } = require('sequelize');
require('dotenv').config();
const {
    models: {
        users,
        dashmodel,
        roundmodel,
        answermodel,
        question_answered_model,
        question_set_model
    }
} = sequelize;
var ansArr = [];
module.exports = (app, passport) => {
    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);
    const authPass = passport.authenticate("jwt",
        {
            session: false
        }
    );
    app.put("/student/answer", authPass, async (req, res) => {
        console.log(req.user)
        if (req.user.role === "s") {
            var { qid, qtype, answer, roundNo, ansLink } = req.body;
            let currenttime = new Date().getTime();
            let save = JSON.parse(
                fs.readFileSync(
                    path.resolve(__dirname + "../../config/auditionConfig.json")
                )
            );
            await dashmodel.findOne({
                where: {
                    uid: req.user.uuid
                }
            }).then(async (student) => {
                if (save.round === roundNo && save.status === "ong" &&
                    /*student.time >= currenttime &&*/ student.round === roundNo) {
                    const dashId = await answermodel.findAll({
                        where: {
                            userDashId: student.uid
                        }
                    })
                    if (!dashId) {
                        await answermodel.create({
                            roundNo: save.round,
                            userDashId: student.uid,
                            dashmodelId: student.id,
                        }).then(async (doc) => {
                            try {
                                question_answered_model.create({
                                    answermodelId: doc.id,
                                    userAnswerId: doc.userDashId,
                                    qid: qid,
                                    qtype: qtype,
                                    answer: answer
                                }).then((ans) => {
                                    res.sendStatus(201)
                                })
                            } catch (err) {
                                console.log(err);
                            }
                        })
                    } else {
                        // Getting record of all the rounds a particular user has played
                        if (dashId.length === save.round) {

                            await question_answered_model.findOne({

                                where: {
                                    [Op.and]: [
                                        { qid: qid },
                                        { userAnswerId: req.user.uuid },
                                    ]
                                }

                            }).then(async (check) => {

                                if (!check) {
                                    await question_answered_model.findOne({
                                        where: {
                                            userAnswerId: req.user.uuid,
                                        }
                                    }).then(async (doc) => {
                                        await question_answered_model.create({
                                            answermodelId: doc.answermodelId,
                                            userAnswerId: doc.userAnswerId,
                                            qid: qid,
                                            qtype: qtype,
                                            answer: answer
                                        }).then((ans) => {
                                            res.sendStatus(201)
                                        })
                                    })
                                } else {
                                    check.qid = qid,
                                        check.qtype = qtype,
                                        check.answer = answer
                                    check.save();
                                }

                            })

                        } else {
                            await answermodel.create({
                                roundNo: save.round,
                                userDashId: student.uid,
                                dashmodelId: student.id,
                            }).then(async (doc) => {
                                try {
                                    question_answered_model.create({
                                        answermodelId: doc.id,
                                        userAnswerId: doc.userDashId,
                                        qid: qid,
                                        qtype: qtype,
                                        answer: answer
                                    }).then((ans) => {
                                        res.sendStatus(201)
                                    })
                                } catch (err) {
                                    console.log(err);
                                }
                            })
                        }
                    }
                } else {
                    res.sendStatus(401);
                }
            })
        } else {
            res.sendStatus(401);
        }
    })

    app.get('/student/getRound', authPass, async (req, res) => {
        let save = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname + "../../config/auditionConfig.json")
            )
        );
        dashmodel.findOne({
            where: {
                uid: req.user.uuid
            }
        }).then((doc) => {
            if (doc.time === 0) {
                var a = doc
                a.time = new Date().getTime() + save.time * 6000 + 2000;
                dashmodel.findOne({
                    where: {
                        uid: req.user.uuid
                    }
                }).then((update) => {
                    update.time = a
                    update.save();
                    roundmodel.findOne({
                        where: {
                            roundNo: save.round
                        }
                    }).then((round) => {
                        if (!round) res.sendStatus(404);
                        res.status(200).json({ round: round, time: a.time });
                    })
                })
            } else {
                roundmodel.findOne({
                    where: {
                        roundNo: save.round
                    }
                }).then((round) => {
                    if (!round) res.sendStatus(404);
                    res.status(200).json({ round: round, time: doc.time });
                })
            }
        })
    })

    app.put('/student/answerround', authPass, async (req, res) => {
        if (req.user.role === "s") {
            var currenttime = new Date().getTime();
            var data = req.body
            if(Array.isArray(data)===false){
                data = [data];
            }
            let save = JSON.parse(
                fs.readFileSync(
                    path.resolve(__dirname + "../../config/auditionConfig.json")
                )
            );
            dashmodel.findOne({
                where: {
                    uid: req.body.uuid
                }
            }).then((doc1) => {
                if (save.round === round.roundNo && save.status === "ong"
                /*&& doc.time >= currenttime*/ && doc1.round === round.roundNo) {
                    data.forEach(doc => {
                        question_answered_model.findOne({
                            where: {
                                [Op.and]: [
                                    { qid: doc.qid || doc.roundId },
                                    { userAnswerId: req.user.uuid }
                                ]
                            }
                        }).then((key) => {
                            if (!key) {
                                answermodel.findOne({
                                    where: {
                                        [Op.and]: [
                                            { userDashId: req.user.uuid },
                                            { roundNo: save.round },
                                        ]
                                    }
                                }).then((nextOp) => {
                                    question_answered_model.create({
                                        answermodelId: nextOp.id,
                                        userAnswerId: doc.userAnswerId,
                                        qid: doc.qid,
                                        qtype: doc.qtype,
                                        answer: doc.answer
                                    }).then((ans) => {
                                        res.sendStatus(201)
                                    })
                                })
                            } else {
                                key.answer = doc.answer,
                                    key.save();
                            }
                        })
                    })
                } else {
                    res.sendStatus(401)
                }
            })
        }
    })

    app.get("/student/getAnswers", authPass, (req, res) => {
        let save = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname + "../../config/auditionConfig.json")
            )
        );
        question_answered_model.findAll({
            where: {
                userAnswerId: req.user.uuid
            }
        }).then(async (doc) => {
            if (!doc) { res.sendStatus(401) }
            await Promise.all(doc.map(async (ans) => {
                await question_set_model.findOne({
                    where: {
                        roundId: ans.qid
                    }
                }).then(async (doc1) => {
                    if (doc1.roundmodelId === save.round) {
                        return ansArr.push(ans);
                    }
                })
            }))
            if (ansArr.length != 0) { res.json({ answers: ansArr }) }
            else { res.sendStatus(404) }
        })
    })


    app.get("/student/get", authPass, async (req, res) => {
        await dashmodel.findOne({
            where: {
                uid: req.user.uuid
            }
        }).then((kid) => {
            if (!kid) { res.sendStatus(404) }
            res.status(200).json({ studenttime: kid.time, studentround: kid.round });
        })
    })

    app.post("/wildcard", authPass, async (req, res) => {
        if (req.user.role === "su") {
            let save = JSON.parse(
                fs.readFileSync(
                    path.resolve(__dirname + "../../config/auditionConfig.json")
                )
            );
            await dashmodel.findOne({
                where: {
                    uid: req.body.uid
                }
            }).then(async (kid) => {
                if (!kid) res.sendStatus(404);
                kid.round = save.round
                kid.status = "unevaluated"
                kid.save().then(() => {
                    if (eventlogger(req.user, `Used the wildcard feature to push ${kid.name} to Round ${save.round}`))
                        res.sendStatus(200)
                    else res.sendStatus(500)
                })
            })
        } else {
            res.sendStatus(401);
        }
    })
}