const { sequelize, models } = require('../models/index');
const worker_connect = require('./controller')
require('dotenv').config();
const { models: { roundmodel, question_set_model } } = sequelize;

module.exports = (app, passport) => {
    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);
    // Round Routes
    const authWall = passport.authenticate("jwt", { session: false });
    // Checked!
    app.post("/addRound", authWall, async (req, res) => {
        if (req.user.role == 'm' || req.user.role == 'su') {
            var presetRounds = 0;
            await roundmodel.findAll().then((doc) => {
                if (!doc)
                    presetRounds = 0;
                else
                    presetRounds = doc.length;
            })
            const { questions, time } = req.body;
            await roundmodel.create({ roundNo: presetRounds + 1, time: time }).then((roundins) => {
                questions.forEach(element => {
                    const { quesText, ImageLink, AudioLink, quesType, options, score } = element
                    question_set_model.create({
                        quesText: quesText,
                        ImageLink: ImageLink,
                        AudioLink: AudioLink,
                        quesType: quesType,
                        options: options,
                        score: score,
                        roundmodelRoundNo: presetRounds + 1
                    })
                });
                const workers = worker_connect.get();
                if (workers.eventlog(req.user, `added Round ${presetRounds + 1}`)) {
                    return res.status(201).json({ success: true });
                } else {
                    return res.status(400).json({ success: false })
                }
            });
        } else {
            return res.status(401);
        }
    })

    // Checked!
    app.get("/getRounds", authWall, async (req, res) => {
        if (req.user.role == 'm' || req.user.role == 'su') {
            let ques_arr = [];
            await roundmodel.findAll({ include: question_set_model }).then(async (roundinfo) => {
                if (roundinfo) {
                    res.status(201).json(roundinfo);
                } else {
                    res.status(400).json({ success: "false" })
                }
            });
        } else {
            return res.sendStatus(401);
        }
    })

    // Checked!
    app.get("/getQuestions", authWall, async (req, res) => {
        if (req.user.role == 'm' || req.user.role == 'su') {
            await question_set_model.findAll().then(async (quizinfo) => {
                if (roundinfo) {
                    res.status(201).json(quizinfo);
                } else {
                    res.status(400).json({ success: "false" })
                }
            });
        } else {
            return res.sendStatus(401);
        }
    })

    // Checked!
    app.post("/addQuestion", authWall, async (req, res) => {
        if (req.user.role == "su" || req.user.role == "m") {
            const { roundNo, quesText, ImageLink, AudioLink, quesType, options, score } = req.body;
            roundmodel.findOne({ where: { roundNo: roundNo } }).then((doc) => {
                question_set_model.create({
                    quesText: quesText,
                    ImageLink: ImageLink,
                    AudioLink: AudioLink,
                    quesType: quesType,
                    options: options,
                    score: score,
                    roundmodelRoundNo: roundNo,
                })
            })
            await question_set_model.findAll({ where: { roundmodelRoundNo: roundNo } }).then((doc) => {
                if (doc) {
                    return res.status(201).json({ success: true })
                } else {
                    return res.status(400).json({ success: false })
                }
            })
        } else {
            return res.sendStatus(401);
        }
    })
    // Edit Question
    app.put("/editQuestion/:id",authWall, async(req,res)=>{
        if(req.user.role==="su" || res.user.role==="m"){
            const Qid = req.params.id;
            question_set_model.findOne({where:{quesId:Qid}}).then((doc) => {
                const { quesText, ImageLink, AudioLink, quesType, options, score } = req.body;
                doc.quesText = quesText
                doc.ImageLink = ImageLink
                doc.AudioLink = AudioLink
                doc.quesType = quesType
                doc.options = options
                doc.score = score
                doc.save();
            })
        } else {
            res.sendStatus(401).json({"Access":"Unauthorized"});
        }
    })


    // Checked!
    app.delete("/removeQuestion/:id", authWall, async (req, res) => {
        if (req.user.role == "su" || req.user.role == "m") {
            try {
                const uuid = req.params.id;
                const question = await question_set_model.findOne({
                    where: {
                        quesId: uuid,
                    }
                })
                await question.destroy();
                return res.status(200).json({ delete: true });
            } catch (err) {
                return res.status(500).json(err);
            }
        }
    })

    // 
    app.delete("/removeRound", authWall, async (req, res) => {
        if (req.user.role == "su" || req.user.role == "m") {
            const getRoundInfo = req.body.roundNo
            console.log(getRoundInfo)
            try {
                const round = await roundmodel.findOne({
                    where: {
                        roundNo: getRoundInfo,
                    }
                })
                await round.destroy();
                return res.status(200).json({ delete: true });
            } catch (err) {
                console.log(err);
                return res.status(500).json(err);
            }
        }
    })
}