const { sequelize } = require('../models');
let { DataTypes } = require('sequelize');
const express = require('express');
// const users = require('../models/users')(sequelize, DataTypes)
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { models: { users, dashmodel } } = sequelize;
module.exports = (app, passport) => {
    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);
    app.post('/auth/signup', async (req, res) => {
        const { username, email, password, role } = req.body;
        await users.create({ username, email, password, role })
            .then(async (details) => {
                await users.createUser(details).then( async (user) => {
                    if (!user) {
                        return res.json({ success: false, message: "User is not registered.." });
                    } else {
                        if (user.role === "s") {
                            await dashmodel.create({
                                uid: user.uuid,
                                name: user.username,
                                email: user.email
                            });

                        }
                        return res.json({ success: true, message: "User is registered.." });
                    }
                })
            })
        // console.log(details);
        // .then((data) => {
        //     try {
        //         return res.status(201).json(data)
        //     } catch (err) {
        //         console.log(err)
        //         return res.status(500).json(err)
        //     }
        // })
    })


    app.post('/auth/login', async (req, res) => {
        const { email, password } = req.body;
        // console.log(`Yay! we have email & password ${email} & ${password}`);
        users.getUserByEmail(email).then((data) => {
            try {
                users.comparePassword(password, data.password, function (err, ans) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json(err);
                    }
                    if (ans) {
                        const payload = {
                            uuid: data.uuid,
                            username: data.username,
                            email: data.email,
                            role: data.role,
                            clearance: data.clearance
                        };
                        console.log(JSON.stringify(payload));
                        let token = jwt.sign(payload, process.env.SECRET, {
                            expiresIn: 600000,
                        });
                        if (data.role === "m" || data.role === "su") {
                            res.cookie('jwt', token);
                            res.json({
                                success: true,
                                token: "Bearer " + token,
                                admin: data.username,
                            });
                        } else {
                            res.cookie('jwt', token);
                            res.json({
                                success: true,
                                token: "Bearer " + token,
                            });
                        }
                    } else {
                        return res.json({
                            success: false,
                            message: "Password does not match",
                        });
                    }
                })
            } catch (err) {
                console.log(err)
                return res.status(500).json(err);
            }
        })
    })

    app.get("/auth/logout", (req, res) => {
        req.session = null;
        req.logout();
        res.status(200).clearCookie('connect.sid', {
            path: '/'
        });
        res.status(200).clearCookie('jwt', {
            path: '/'
        });
        res.send("Logged out successfully");
    });

    app.get("/auth/google", passport.authenticate("google", {
        scope: ["email", "profile"],
    }));

    app.get("/auth/google/callback", passport.authenticate("google"),
        async (req, res) => {
            const payload = {
                id: req.user.uuid,
                username: req.user.username,
                email: req.user.email,
                //  password: req.user.password,
                role: req.user.role,
                clearance: req.user.clearance
            };
            var token = jwt.sign(payload, process.env.SECRET, { expiresIn: 600000 });
            res.cookie('jwt', token);
            await dashmodel.findOne({ where: { email: req.user.email } }).then(async (doc) => {
                if (!doc) {
                    await dashmodel.create({
                        uid: req.user.uuid,
                        name: req.user.username,
                        email: req.user.email,
                    })
                    res.status(201).json({
                        success: true,
                        token: "Bearer " + token,
                        user: "Created"
                    });
                    //res.redirect(`${process.env.FRONTEND}?token=${token}`);
                } else {
                    res.status(201).json({
                        success: true,
                        token: "Bearer " + token,
                        user: "exists already"
                    });
                    // if (req.user.mode === 'google')
                    // res.redirect(`${process.env.FRONTEND}?token=${token}`);
                    // else
                    // res.redirect(`${process.env.FRONTEND}register?error=email`);
                }
            })
            // res.status(201).json({
            //     success: true,
            //     token: "Bearer " + token,
            // });
        });
    app.get("/auth/github", passport.authenticate("github"));

    app.get("/auth/github/callback", passport.authenticate("github"),
        async (req, res) => {
            const payload = {
                id: req.user.uuid,
                UserName: req.user.username,
                email: req.user.email,
                //  password: req.user.password,
                role: req.user.role,
                clearance: req.user.clearance
            };
            var token = jwt.sign(payload, process.env.SECRET, { expiresIn: 600000 });
            res.cookie('jwt', token);
            await dashmodel.findOne({ where: { email: req.user.email } }).then(async (doc) => {
                if (!doc) {
                    await dashmodel.create({
                        uid: req.user.uuid,
                        name: req.user.username,
                        email: req.user.email,
                    })
                    res.status(201).json({
                        success: true,
                        token: "Bearer " + token,
                        user: "Created"
                    });
                    //res.redirect(`${process.env.FRONTEND}?token=${token}`);
                } else {
                    res.status(201).json({
                        success: true,
                        token: "Bearer " + token,
                        user: "exists already"
                    });
                    // if (req.user.mode === 'google')
                    // res.redirect(`${process.env.FRONTEND}?token=${token}`);
                    // else
                    // res.redirect(`${process.env.FRONTEND}register?error=email`);
                }
            })
            // res.status(201).json({
            //     success: true,
            //     token: "Bearer " + token,
            // });
        });

}