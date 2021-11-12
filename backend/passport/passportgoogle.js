const GoogleStrategy = require('passport-google-oauth20')
let { DataTypes } = require('sequelize');
const { sequelize } = require('../models');
const User = require('../models/users')(sequelize, DataTypes)
require('dotenv').config();
module.exports = function (passport) {

    passport.serializeUser((user, done) => {
        //done(null, user.id);
        User.getUserById(user.uuid).then((data) => {
            done(null, data);
        })
    })

    passport.deserializeUser((user, done) => {
        User.getUserById(user.uuid).then((user) => {
            done(null, user);

        })
    })

    passport.use(new GoogleStrategy({
        callbackURL: process.env.GOOGLE_CALLBACK,
        clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET
    }, async (accessToken, refreshToken, profile, done) => {
        // console.log(profile);
        await User.getUserByEmail(profile.emails[0].value).then(async (currentUser) => {
            if (currentUser) {
                console.log('Existing User: ' + currentUser)
                done(null, currentUser);
            }
            else {
                const details = await User.create({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    password: profile.id,
                    mode : 'google'
                })
                await User.createUser(details.dataValues).then((newUser) => {
                    done(null, newUser)
                })
            }
        })

    }))

}