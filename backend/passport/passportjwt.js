const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const { sequelize } = require('../models');
let {DataTypes} = require('sequelize');
const User = require('../models/users')(sequelize, DataTypes)

require('dotenv').config();

module.exports = function (passport) {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    //opts.secretOrKey = 'GLUGAUDITION2021';
    opts.secretOrKey = process.env.SECRET;
    passport.use(new JwtStrategy(opts, (jwt_payload, callback) => {
        User.getUserById(jwt_payload.id).then((data,err) => {
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
        done(null, user.id);
    })

    passport.deserializeUser((id, done) => {
        User.getUserById(id).then((user) => {
            done(null, user);

        })
    })
}
