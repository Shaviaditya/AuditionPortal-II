const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');
const eventlogger = require('./eventLogger');
const passport = require('passport');
require('dotenv').config();
const {
    models:
    {
        users,
        dashmodel,
        roundmodel,
        question_answered_model,
        answermodel
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
        if (req.user.role === 's') {
            var qid = req.body.qid;
            var qtype = req.body.qtype;
            var answer = req.body.answer;
            var roundNo = req.body.round;
            var ansLink = req.body.ansLink;
            var currenttime = new Date().getTime();
            let save = JSON.parse(
                fs.readFileSync(
                    path.resolve(__dirname + "../../config/auditionConfig.json")
                )
            );

            const dashCall = await dashmodel.findOne({ where: { uid: req.user.uuid } })
            if (dashCall) {
                if (save.round === roundNo && save.status === "ong" && dashCall.time >= currenttime && dashCall.round === roundNo) {
                }
            } else {
                res.status(401);
            }
        }
    })
}