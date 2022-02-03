const { sequelize, models } = require('../models/index');
const fs = require("fs");
const path = require('path');
const { all, Op } = require('sequelize');
require('dotenv').config();
const {
    models: {
        users,
        roundmodel,
        question_answered_model,
        question_set_model
    }
} = sequelize;
// const workers = worker_connect.get();
module.exports = (app, passport) => {
    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);
    const authPass = passport.authenticate("jwt",
        {
            session: false
        }
    );
    // Overall Save
    app.put("/student/answerround",authPass, async(req,res) => {
        try{
            const answers = req.body.answers;
            const userId = req.user.uuid;
            answers.forEach(async ans => {
                await question_answered_model.findOne({
                    where:{
                        [Op.and]:[
                            { userUuid: userId },
                            { qid : ans.qid }
                        ]
                    }
                }).then(async (doc) => {
                    if(doc) {
                        doc.answer = ans.answer,
                        doc.ansLink = ans.ansLink
                        doc.save();   
                    } else {
                        const new_ans = await question_answered_model.create({
                            userUuid: userId,
                            roundInfo: ans.roundNo,
                            qid: ans.qid,
                            qtype: ans.qtype,
                            answer: ans.answer,
                            ansLink: ans.ansLink,
                        })
                    }
                })
            })
            res.sendStatus(200).json({"Changes":"Applied!"})
        } catch (e) {
            res.sendStatus(404).json({"Error":e})
        }
    })
    // each answer is processed at one time.
    app.put("/student/answer", authPass, async (req, res) => {
        // The Route is fot each answer a student shall give....
        // console.log(req.user)
        if (req.user.role === "s") {
            var { qid, qtype, answer, roundNo, ansLink } = req.body;
            console.log(req.body);
            let currenttime = new Date().getTime();
            let save = JSON.parse(
                fs.readFileSync(
                    path.resolve(__dirname + "../../config/auditionConfig.json")
                )
            );
            var answer_decode = "";
            if(Array.isArray(answer)==true){
                answer.forEach(element => {
                    answer_decode.concat(element+",");
                });
                answer = answer_decode.substring(0,answer_decode.length-1);
            } 
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

    app.get('/student/getRound', authPass, async (req, res) => {
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
                    doc.time = new Date().getTime() + save.time * 60000 + 2000;
                    doc.save();
                    console.log(doc)
                    roundmodel.findAll({
                        include:[{
                            model:question_set_model,
                            where:{
                                roundmodelRoundNo:save.round
                            }
                        }] 
                    }).then((round) => {
                        if (!round) res.sendStatus(404);
                        res.status(200).json({ data: round, time: doc.time });
                    })
                } else {
                    /* doc.time = new Date().getTime() + save.time * 60000 + 2000;
                    doc.save();
                    console.log(doc) */
                    roundmodel.findAll({
                        include:[{
                            model:question_set_model,
                            where:{
                                roundmodelRoundNo:save.round
                            },
                            
                        }] 
                    }).then((round) => {
                        if (!round) res.sendStatus(404);
                        res.status(200).json({ data: round, time: doc.time });
                    })
                }
            }
        })
    })

    app.get("/student/getAnswers", authPass, (req, res) => {
        let ansArr = [];
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
            if (ansArr.length != 0) { 
                console.log(ansArr.length)
                res.json({ answers: ansArr }) 
            }
            else { res.sendStatus(404) }
        })
    })


    app.get("/student/get", passport.authenticate("jwt", { session: false }), async (req, res) => {
        await users.findOne({
            where: {
                uuid: req.user.uuid
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
            await users.findOne({
                where: {
                    uuid: req.body.uuid
                }
            }).then(async (kid) => {
                if (!kid) res.sendStatus(404);
                kid.round = save.round
                kid.status = "unevaluated"
                kid.save().then(async () => {
                    // const worker1 = worker_connect.get();
                    if (await eventlogger(req.user, `Used the wildcard feature to push ${kid.username} to Round ${save.round}`))
                        res.sendStatus(200)
                    else res.sendStatus(500)
                })
            })
        } else {
            res.sendStatus(401);
        }
    })
}