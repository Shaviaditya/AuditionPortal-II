const { sequelize, models } = require('../models/index');
const eventlogger = require('./eventLogger');
const fs = require("fs");
const path = require('path');
const { all } = require('sequelize');
require('dotenv').config();
const {
    models: {
        users,
        dashmodel,
        roundmodel,
        answermodel,
        question_answered_model
    }
} = sequelize;

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
                await dashmodel.findOne({ where: { uid: req.user.uuid } }).then(async (doc) => {
                    try {
                        const { count } = await answermodel.findAndCountAll();
                        await answermodel.findOrCreate({ 
                            where: { 
                                roundNo: roundNo 
                            },
                            defaults: {
                                dashmodelId : count+1,
                                roundNo: doc.round,
                            }}).then(async (check) => {
                            try {
                                const { count } = await question_answered_model.findAndCountAll();
                                await question_answered_model.findOrCreate({
                                    where: {
                                        qid: qid
                                    },
                                    defaults: {
                                        answermodelId: count+1,
                                        qid: qid,
                                        qtype: qtype,
                                        answer: answer
                                    }
                                }).then(async (ans) => {
                                    res.sendStatus(201)
                                })
                            } catch (error) {
                                console.log(error)
                            }
                        })
                        // if(save.round === round && save.status === "ong" && doc.time >= currenttime && doc.round === roundNo ){
                        //     await answermodel.findOrCreate({ where : { roundNo : round } }).then( async (check)=>{
                        //         if(!check){
                        //             await question_answered_model.create({
                        //                 qid: qid,
                        //                 qtype: qtype,
                        //                 answer: answer
                        //             });
                        //         }
                        //     }) 
                        // } else {
                        //     res.sendStatus(401);
                        // }
                    } catch (error) {
                        console.log(error)
                    }
                })
            } catch (error) {
                console.log(error)
            }
        } else {
            res.sendStatus(401);
        }
    })

    app.get('/getAns', authPass ,async(req,res) => {
        const result = await dashmodel.findOne({ where : { uid : req.user.uuid }, include : [ {model: answermodel,include:[question_answered_model]}]}); 
        console.log(JSON.stringify(result));
        return res.send(result);
    })
}