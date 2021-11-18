const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { sequelize } = require('../models');
let {DataTypes} = require('sequelize');
// const User = require('../models/users')(sequelize, DataTypes)
const models = require('../models');
const  { models : { users }} = sequelize;
require('dotenv').config();
var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies) token = req.cookies['jwt'];
    return token;
  };
module.exports = function (passport) {
    let opts = {};
    opts.jwtFromRequest = cookieExtractor;
    //opts.secretOrKey = 'GLUGAUDITION2021';
    opts.secretOrKey = process.env.SECRET;
    passport.use(new JwtStrategy(opts, (jwt_payload, callback) => {
        users.getUserById(jwt_payload).then((data,err) => {
            if (err) {
                return callback(err, false);
            }
            if (data) {
                return callback(null, data);
            } else {
                return callback(null, false);
            }
        });
    }))


    passport.serializeUser((user, done) => {
        users.getUserById(user).then((data) => {
            console.log(user);
            done(null, data);
        })
    })

    passport.deserializeUser((user, done) => {
        users.getUserById(user).then((user) => {
            console.log(user);
            done(null, user);

        })
    })
}
