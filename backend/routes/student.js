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
        if (req.user.role === "s") {
            var { qid, qtype, answer, roundNo, ansLink } = req.body;
            let currenttime = new Date().getTime();
            let save = JSON.parse(
                fs.readFileSync(
                    path.resolve(__dirname + "../../config/auditionConfig.json")
                )
            );
            try {
                await dashmodel.findOne({
                    where: {
                        uid: req.user.uuid
                    }
                }).then(async (student) => {

                    const dashId = await answermodel.findOne({
                        where: {
                            userDashId: student.uid
                        }
                    })
                    if (!dashId) {
                        await answermodel.create({
                            roundNo: roundNo,
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
                    }
                })
            } catch (error) {
                console.log(error)
            }
        } else {
            res.sendStatus(401);
        }
    })

    app.get('/getAns', authPass, async (req, res) => {
        const result = await dashmodel.findAll({ include: [{ model: answermodel, include: [question_answered_model] }] });
        console.log(JSON.stringify(result));
        return res.send(result);
    })

    app.get("/student/getAnswers", authPass, (req, res) => {
        let save = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname + "../../config/auditionConfig.json")
            )
        );
        question_answered_model.findAll({
            where:{
                userAnswerId : req.user.uuid
            }
        }).then(async (doc) => {
            if(!doc) { res.sendStatus(401) }
            await Promise.all(doc.map(async (ans)=>{
                await question_set_model.findOne({
                    where:{
                        roundId : ans.qid
                    }
                }).then(async (doc1)=>{
                    if(doc1.roundmodelId === save.round){
                        return ansArr.push(ans);
                    } 
                })
            }))
            if(ansArr.length!=0) { res.json ({answers: ansArr })}
            else {res.sendStatus(404)}
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