const { sequelize } = require('../models');
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { models: { users } } = sequelize;
const express = require('express')
const authRouter = express.Router()
require('../passport/passportgithub')(passport)
require('../passport/passportgoogle')(passport)
require('../passport/passportjwt')(passport)
authRouter.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;
    if (role === "su") {
        return res.sendStatus(403).json({ success: false })
    } else {
        await users.create({ username, email, password, role })
            .then(async (details) => {
                await users.createUser(details).then(async (user) => {
                    if (!user) {
                        return res.json({ success: false, message: "User is not registered.." });
                    } else {
                        return res.sendStatus(201).json({ success: true, message: "User is registered.." });
                    }
                })
            })
    }
})


authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // console.log(`Yay! we have email & password ${email} & ${password}`);
    users.getUserByEmail(email).then((data) => {
        try {
            users.comparePassword(password, data.password, async (err, ans) => {
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
                        res.status(201).json({
                            success: true,
                            token: "Bearer " + token,
                            user: "exists already"
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

authRouter.get("/logout", (req, res) => {
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

authRouter.get("/google", passport.authenticate("google", {
    scope: ["email", "profile"],
}));

authRouter.get("/google/callback", passport.authenticate("google"),
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
        res.status(201).json({
            success: true,
            token: "Bearer " + token,
            user: "exists already"
        });
    });
authRouter.get("/github", passport.authenticate("github"));

authRouter.get("/github/callback", passport.authenticate("github"),
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
        res.status(201).json({
            success: true,
            token: "Bearer " + token,
            user: "exists already"
        });
    });
module.exports =  authRouter;