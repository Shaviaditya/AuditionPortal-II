const { sequelize, models } = require('../models/index');
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
            const { time, quesText, quesLink, quesType, options, score } = req.body;
            await roundmodel.create({ roundNo: presetRounds + 1, time: time }).then((roundins)=>{
                question_set_model.create({
                    roundNo: presetRounds + 1,
                    quesText: quesText,
                    quesLink: quesLink,
                    quesType: quesType,
                    options: options,
                    score: score,
                    roundmodelId: roundins.id 
                })
            });
            await roundmodel.findOne({ where: { roundNo: presetRounds + 1 }, }).then(async (roundinfo) => {
                await question_set_model.findOne({ where: { roundNo: roundinfo.roundNo } }).then(async (doc) => {
                    try{
                        if(eventlogger(req.user, `added Round ${presetRounds + 1}`)){
                            return res.status(201).json({ success: true });
                        }else {
                            return res.status(400).json({ success: false })
                        }
                    } catch (err) {
                        console.log(err);
                    }
                })
            })
        } else {
            return res.status(401);
        }
    })

    // Checked!
    app.get("/getRounds", authWall, async (req, res) => {
        if (req.user.role == 'm' || req.user.role == 'su') {
            let ques_arr = [];
            await roundmodel.findAll({ include : question_set_model}).then(async (roundinfo) => {
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

    // Checked!
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

    // Checked!
    app.post("/addQuestion", authWall, async (req, res) => {
        if (req.user.role == "su" || req.user.role == "m") {
            const { roundNo, quesText, quesLink, quesType, options, score } = req.body;
            roundmodel.findOne({where:{roundNo:roundNo}}).then((doc)=>{
                question_set_model.create({
                    roundNo: roundNo,
                    quesText: quesText,
                    quesLink: quesLink,
                    quesType: quesType,
                    options: options,
                    score: score,
                    roundmodelId: doc.id,
                })
            })
            await question_set_model.findAll({ where: { roundNo: roundNo }}).then((doc) => {
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

    // Checked!
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
                await question_set_model.findAll({
                    where:{
                        roundNo: getRoundInfo,
                    }
                }).then((question)=>{
                    question.destroy;
                })
                return res.status(200).json({ delete: true });
            } catch (err) {
                console.log(err);
                return res.status(500).json(err);
            }
        }
    })
}