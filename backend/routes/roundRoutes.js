const { sequelize, models } = require('../models/index');
// const { sequelize} = require('sequelize')
// const {eventlogger} = require('./eventLogger');
require('dotenv').config();
const { models: { users, roundmodel, question_set_model } } = sequelize;

module.exports = (app, passport) => {

    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);
    require("./eventLogger")(app)
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
            await roundmodel.create({ roundNo: presetRounds+1, time : time });
            await question_set_model.create({
                roundId: presetRounds+1,
                quesText: quesText,
                quesLink: quesLink,
                quesType: quesType,
                options: options,
                score: score,
            })
            await roundmodel.findOne({where:{roundNo: presetRounds+1},  include: [{ model: question_set_model }]}).then((doc) => {
                if(eventlogger(req.user, `added Round ${total + 1}`)){
                    return res.status(201).json({success: true});
                } else {
                    return res.status(400).json({success: false})
                }
            })
        } else {
            return res.status(401);
        }
    })

    app.get("/getRounds", authWall, async (req, res) => {
        if (req.user.role == 'm' || req.user.role == 'su') {
            await roundmodel.findAll({ include: [{ model: question_set_model }] }).then((data) => {
                if (!data) {
                    return res.json({ success: false });
                } else {
                    return res.send(data);
                }
            });
        } else {
            return res.sendStatus(401);
        }
    })

    app.post("/addQuestion",authWall, async (req,res) => {
        if(req.user.role == "su" ||  req.user.role == "m")
        {
            const { roundId,quesText, quesLink, quesType, options, score } = req.body;
            await question_set_model.create({
                roundId: roundId,
                quesText: quesText,
                quesLink: quesLink,
                quesType: quesType,
                options: options,
                score: score,
            })
            await roundmodel.findOne({where:{roundNo: roundId},  include: [{ model: question_set_model }]}).then((doc) => {
                if(doc){
                    return res.status(201).json(doc);
                } else {
                    return res.status(400).json({success: false})
                }
            })
        } else {
            return res.sendStatus(401);
        }
    })
    app.delete("/removeQuestion", authWall, async(req,res) => {
        if(req.user.role == "su" ||  req.user.role == "m")
        {
            try {
                const question = await question_set_model.findOne({
                    where: {
                        id : req.body.id,
                    }
                })
                await question.destroy();
                return res.status(200).json({delete : true});
            } catch (err) {
                return res.status(500).json(err);
            }
        }
    })
    app.delete("/updateRound", authWall, async(req,res) => {
        if(req.user.role == "su" ||  req.user.role == "m")
        {
            try {
                const round = await roundmodel.findOne({
                    where: {
                        roundNo : req.body.roundId,
                    }
                })
                await round.destroy();
                return res.status(200).json({delete : true});
            } catch (err) {
                return res.status(500).json(err);
            }
        }
    })
}