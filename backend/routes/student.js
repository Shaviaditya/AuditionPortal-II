const { sequelize, models } = require('../models/index');
const fs = require("fs");
const path = require('path');
const { Op } = require('sequelize');
const express = require('express')
const studentRouter = express.Router();
const {authWall} = require('../middleware/authpass');
const { eventlogger } = require('./eventLogger');
require('dotenv').config();
const {
    models: {
        users,
        roundmodel,
        question_answered_model,
        question_set_model
    }
} = sequelize;
var ansArr = [];
studentRouter.put("/student/answer", authWall, async (req, res) => {
    // The Route is fot each answer a student shall give....
    // console.log(req.user)
    if (req.user.role === "s") {
        var { qid, qtype, answer, roundNo, ansLink } = req.body;
        let currenttime = new Date().getTime();
        let save = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname + "../../config/auditionConfig.json")
            )
        );
        // Finds his dashboard 
        await users.findOne({
            where: {
                uuid: req.user.uuid
            }
        }).then(async (student) => {
            // console.log(qid);
            const data1 = await question_set_model.findOne({ where: { quesId : qid }})
            const roundNo = data1.roundmodelRoundNo
            // console.log(data1)
            if (save.round === roundNo && save.status === "ong" &&
                student.time >= currenttime && student.round === roundNo) {
                // Checks whether the student has answered any rounds or not.....
                await question_answered_model.findOne({
                    where: {
                        userUuid: student.uuid,
                        roundInfo: roundNo
                    }
                }).then(async roundAnswered => {
                    // Say he hasn't then saving this current round as his first one.... 
                    // Strictly for the first question of any round.
                    if (!roundAnswered) {
                        await question_answered_model.create({
                            userUuid: student.uuid,
                            roundInfo: roundNo,
                            qid: qid,
                            qtype: qtype,
                            answer: answer,
                            ansLink: ansLink,
                        }).then((ans) => {
                            res.sendStatus(201)
                        })
                    } else {
                        await question_answered_model.findOne({
                            where: {
                                userUuid: student.uuid,
                                qid: qid
                            }
                        }).then(async (check) => {
                            if (!check) {
                                await question_answered_model.create({
                                    userUuid: student.uuid,
                                    roundInfo: roundNo,
                                    qid: qid,
                                    qtype: qtype,
                                    answer: answer,
                                    ansLink: ansLink,
                                }).then((ans) => {
                                    res.sendStatus(201).json(JSON.stringify(ans));
                                })
                            } else {
                                // Updates the answer he will give.
                                check.qid = qid,
                                    check.qtype = qtype,
                                    check.answer = answer,
                                    check.ansLink = ansLink
                                check.save();
                            }
                            res.sendStatus(201)
                        })
                    }
                })
            } else {
                res.sendStatus(401);
            }
        })
    } else {
        res.sendStatus(401);
    }
})

studentRouter.get('/student/getRound', authWall, async (req, res) => {
    let save = JSON.parse(
        fs.readFileSync(
            path.resolve(__dirname + "../../config/auditionConfig.json")
        )
    );
    users.findOne({
        where: {
            uuid: req.user.uuid
        }
    }).then((doc) => {
        console.log(doc)
        if ((req.user.role === 's' && doc.round == save.round && save.status === "ong") || (req.user.role === 'su' || req.user.role === 'm')) {
            if (doc.time === '0') {
                doc.time = new Date().getTime() + save.time * 6000 + 2000;
                doc.save();
                console.log(doc)
                roundmodel.findOne({
                    where: {
                        roundNo: save.round
                    }
                }).then((round) => {
                    if (!round) res.sendStatus(404);
                    res.status(200).json({ round: round, time: doc.time });
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
        }
    })
})

studentRouter.get("/student/getAnswers", authWall, (req, res) => {
    let save = JSON.parse(
        fs.readFileSync(
            path.resolve(__dirname + "../../config/auditionConfig.json")
        )
    );
    question_answered_model.findAll({
        where: {
            userUuid: req.user.uuid
        }
    }).then(async (doc) => {
        if (!doc) { res.sendStatus(401) }
        await Promise.all(doc.map(async (ans) => {
            await question_set_model.findOne({
                where: {
                    quesId: ans.qid
                }
            }).then(async (doc1) => {
                if (doc1.roundmodelRoundNo === save.round) {
                    return ansArr.push(ans);
                }
            })
        }))
        if (ansArr.length != 0) { res.json({ answers: ansArr }) }
        else { res.sendStatus(404) }
    })
})


studentRouter.get("/student/get", authWall, async (req, res) => {
    await users.findOne({
        where: {
            uuid: req.user.uuid
        }
    }).then((kid) => {
        if (!kid) { res.sendStatus(404) }
        res.status(200).json({ studenttime: kid.time, studentround: kid.round });
    })
})

studentRouter.post("/wildcard", authWall, async (req, res) => {
    if (req.user.role === "su") {
        let save = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname + "../../config/auditionConfig.json")
            )
        );
        await users.findOne({
            where: {
                uuid: req.body.uuid
            }
        }).then(async (kid) => {
            if (!kid) res.sendStatus(404);
            kid.round = save.round
            kid.status = "unevaluated"
            kid.save().then(async () => {
                if (await eventlogger(req.user, `Used the wildcard feature to push ${kid.username} to Round ${save.round}`))
                    res.sendStatus(200)
                else res.sendStatus(500)
            })
        })
    } else {
        res.sendStatus(401);
    }
})

module.exports = studentRouter;