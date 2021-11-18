const { sequelize } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {models:{users,roundmodel,question_set_model}} = sequelize;
module.exports = (app, passport) => {
    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);
    // Round Routes
    const authWall = passport.authenticate("jwt",{session: false});
    app.post("/addRound", authWall ,async (req,res) => {
        if(req.user.role === 'm' || req.user.role === 'su'){
            var roundFreq = 0;
            await roundmodel.findAll({ include: [{ model: question_set_model }] }).then((data)=>{
                if(!data){
                    roundFreq = 0;
                } else {
                    roundFreq = data.length;
                }
            });
            console.log(roundFreq);
            console.log(req.body);
            return res.status(201).json({success:'true'});
        } else {
            return res.status(401).send("Access Denied");
        }
    })   
}