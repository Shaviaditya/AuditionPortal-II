const { sequelize, models } = require('../models/index');
//const eventLogger = require('./eventLogger');
// const { sequelize} = require('sequelize')
const eventlogger = require('./eventLogger');
require('dotenv').config();
const { models: { users, roundmodel, question_set_model, eventmodel } } = sequelize;

module.exports = (app, passport) => {

    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);
    // require("./eventLogger")(app)
    // Round Routes
    const authWall = passport.authenticate("jwt", { session: false });

    app.post("/addRound", authWall, async (req, res) => {
        if (req.user.role == 'm' || req.user.role == 'su') {
            var presetRounds = 0;
            await roundmodel.findAll().then((doc) => {
                if (!doc)
                    presetRounds = 0;
                else
                    presetRounds = doc.length;
            })
            const { time, quesText, quesLink, quesType, options, score } = req.body;
            await roundmodel.create({ roundNo: presetRounds + 1, time: time });
            await question_set_model.create({
                roundmodelId: presetRounds + 1,
                quesText: quesText,
                quesLink: quesLink,
                quesType: quesType,
                options: options,
                score: score,
            })
            await roundmodel.findOne({ where: { roundNo: presetRounds + 1 }, }).then(async (roundinfo) => {
                await question_set_model.findOne({ where: { roundmodelId: roundinfo.roundNo } }).then(async (doc) => {
                    // if (doc) {
                    if(await eventlogger(req.user, `added Round ${presetRounds + 1}`)){
                        return res.status(201).json({ success: true });
                    } else {
                        return res.status(400).json({ success: false })
                    }
                })
            })
        } else {
            return res.status(401);
        }
    })

    app.get("/getRounds", authWall, async (req, res) => {
        if (req.user.role == 'm' || req.user.role == 'su') {
            let ques_arr = [];
            await roundmodel.findAll().then(async (roundinfo) => {
                if(roundinfo){
                    res.status(201).json(roundinfo);
                } else {
                    res.status(400).json({success: "false"})
                }
            });
        } else {
            return res.sendStatus(401);
        }
    })

    app.get("/getQuestions", authWall, async (req, res) => {
        if (req.user.role == 'm' || req.user.role == 'su') {
            await question_set_model.findAll().then(async (quizinfo) => {
                if(roundinfo){
                    res.status(201).json(quizinfo);
                } else {
                    res.status(400).json({success: "false"})
                }
            });
        } else {
            return res.sendStatus(401);
        }
    })

    app.post("/addQuestion", authWall, async (req, res) => {
        if (req.user.role == "su" || req.user.role == "m") {
            const { roundNo, quesText, quesLink, quesType, options, score } = req.body;
            await question_set_model.create({
                roundmodelId: roundNo,
                quesText: quesText,
                quesLink: quesLink,
                quesType: quesType,
                options: options,
                score: score,
            })
            await question_set_model.findAll({ where: { roundmodelId: roundNo }}).then((doc) => {
                if (doc) {
                    return res.status(201).json({success: true})
                } else {
                    return res.status(400).json({ success: false })
                }
            })
        } else {
            return res.sendStatus(401);
        }
    })
    app.delete("/removeQuestion/:id", authWall, async (req, res) => {
        if (req.user.role == "su" || req.user.role == "m") {
            try {
                const uuid = req.params.id;
                const question = await question_set_model.findOne({
                    where: {
                        roundId: uuid,
                    }
                })
                await question.destroy();
                return res.status(200).json({ delete: true });
            } catch (err) {
                return res.status(500).json(err);
            }
        }
    })
    app.delete("/updateRound", authWall, async (req, res) => {
        if (req.user.role == "su" || req.user.role == "m") {
            try {
                const round = await roundmodel.findOne({
                    where: {
                        roundNo: req.body.roundmodelId,
                    }
                })
                await round.destroy();
                return res.status(200).json({ delete: true });
            } catch (err) {
                return res.status(500).json(err);
            }
        }
    })
}