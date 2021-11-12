const { sequelize } = require('../models');
let { DataTypes } = require('sequelize');
const users = require('../models/users')(sequelize, DataTypes)
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (app, passport) => {
    require("../passport/passportjwt")(passport);
    require("../passport/passportgoogle")(passport);
    require("../passport/passportgithub")(passport);
    app.post('/auth/signup', async (req, res) => {
        const { username, email, password, role } = req.body;
        const details = await users.create({ username, email, password, role })
        await users.createUser(details)
            .then((data) => {
                try {
                    return res.status(201).json(data)
                } catch (err) {
                    console.log(err)
                    return res.status(500).json(err)
                }
            })
    })


    app.post('/auth/login', async (req, res) => {
        const { email, password } = req.body;
        console.log(`Yay! we have email & password ${email} & ${password}`);
        users.getUserByEmail(email).then((data) => {
            try {
                users.comparePassword(password, data.password, function (err, ans) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json(err);
                    }
                    if (ans) {
                        const payload = {
                            id: data.uuid,
                            username: data.username,
                            email: data.email,
                            role: data.role,
                        };
                        console.log(JSON.stringify(payload));
                        let token = jwt.sign(payload, process.env.SECRET, {
                            expiresIn: 600000,
                        });
                        if (data.role === "m" || data.role === "su") {
                            res.json({
                                success: true,
                                token: "Bearer " + token,
                                admin: data.username,
                            });
                        } else {
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
        req.logout();
        res.send("Logged out successfully");
    });

    app.get("/auth/google", passport.authenticate("google", {
        scope: ["email", "profile"],
    }));

    app.get("/auth/google/callback", passport.authenticate("google"),
        (req, res) => {
            const payload = {
                id: req.user.uuid,
                username: req.user.username,
                email: req.user.email,
                //  password: req.user.password,
                role: req.user.role,
                clearance: req.user.clearance
            };
            var token = jwt.sign(payload, process.env.SECRET, { expiresIn: 600000 });
            return res.status(201).json(payload)
        });
    app.get("/auth/github", passport.authenticate("github"));

    app.get("/auth/github/callback", passport.authenticate("github"),
        (req, res) => {
            const payload = {
                id: req.user._id,
                UserName: req.user.UserName,
                email: req.user.email,
                //  password: req.user.password,
                role: req.user.role,
                clearance: req.user.clearance
            };
            var token = jwt.sign(payload, process.env.SECRET, { expiresIn: 600000 });
            return res.status(201).json(payload)
        });

}