const GitHubStrategy = require("passport-github2");
let {DataTypes} = require('sequelize');
const { sequelize } = require('../models');
const User = require('../models/users')(sequelize, DataTypes)
require('dotenv').config();
module.exports = function (passport) {
    const fetch = require('node-fetch');
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
    passport.use(
        new GitHubStrategy(
          {
            callbackURL: process.env.GITHUB_CALLBACK,
            clientID: process.env.GITHUB_OAUTH_CLIENT_ID,
            clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
            scope: ['user:email'],
          },
          (accessToken, refreshToken, profile, done) => {
            var options = {
              headers: {
                'User-Agent': 'JavaScript.en',
                'Authorization': 'token ' + accessToken
              },
              json: true,
              url: 'https://api.github.com/user/emails'
            };
            fetch('https://api.github.com/user/emails', {
              json: true,
              headers: {
                'User-Agent': 'JavaScript.en',
                'Authorization': 'token ' + accessToken
              },
            })
              .then(res => res.json())
              .then(async (json) => {
                var emails = json.filter(function (email) {
                  return (email.verified) && (email.email.toString().includes("users.noreply.github.com") === false);
                });
    
                if (!emails.length) {
                  return done(null, false);
                }
                profile.emails = emails;
                console.log(profile)
                await User.getUserByEmail(profile.emails[0].email).then(async (currentUser) => {
                  if (currentUser) {
                    console.log("Existing User: " + currentUser);
                    done(null, currentUser);
                  } else {
                    const details = await User.create({
                      username: (profile.displayName === null || profile.displayName === undefined)?profile.username:profile.displayName,
                      email: profile.emails[0].email,
                      password: profile.username,
                      mode: 'github'
                    })
                    await User.createUser(details.dataValues).then((newUser) => {
                        done(null, newUser)
                    })
                  }
                });
              }).catch(err => {
                console.error(err)
                done(null, false)
              });
            // get emails using oauth toke
    
          }
        )
      );
}