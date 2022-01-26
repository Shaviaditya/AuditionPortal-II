const { sequelize, models } = require("../models/index");
const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { Op } = require("sequelize");
const { eventlogger } = require("./eventLogger");
const { sendMail } = require("../services/reportSender");
const manageRouter = express.Router();
require("dotenv").config();
const { authWall } = require("../middleware/authpass");
const {
    models: { users, question_answered_model, roundmodel },
} = sequelize;
const { Worker, isMainThread } = require("worker_threads");
let worker;
if (isMainThread) {
    worker = new Worker("../services/reportSender.js");
    worker.on("message", (data) => {
        console.log(data);
    });
    worker.on("error", (data) => {
        console.log(`Error!`);
    });
    worker.on("exit", (data) => {
        console.log(`Exit`);
    });
}
manageRouter.post("/protected/getUser", authWall, async (req, res) => {
    console.log(req.user);
    if (req.user.role === "m" || req.user.role === "su") {
        try {
            let userArr = [];
            // Eager Loading not working so applied Lazy Loading based on Promises
            await users
                .findOne({ where: { uuid: req.body.uuid } })
                .then(async (e) => {
                    if (!e) {
                        res.sendStatus(404);
                    }
                    await question_answered_model
                        .findAll({ where: { userUuid: e.uuid } })
                        .then((data) => {
                            return userArr.push([e, { responses: data }]);
                        });
                });
            return res.status(200).json({ data: userArr, user: req.user.username });
        } catch (e) {
            res.sendStatus(404);
            console.log(e);
        }
    } else {
        try {
            const data = await users.findOne({ where: { uuid: req.user.uuid } });
            data.flag = true;
            data.save();
            return res.status(200).json(data);
        } catch (e) {
            console.log(e);
            return res.status(401);
        }
    }
});

manageRouter.get("/protected/getUsers", authWall, async (req, res) => {
    // console.log(req.user);
    if (req.user.role === "m" || req.user.role === "su") {
        try {
            let userArr = [];
            // Eager Loading not working so applied Lazy Loading based on Promises
            await users.findAll({ where: { role: "s" } }).then(async (d1) => {
                await Promise.all(
                    d1.map(async (e) => {
                        await question_answered_model
                            .findAll({ where: { userUuid: e.uuid } })
                            .then((data) => {
                                return userArr.push([e, { responses: data }]);
                            });
                    })
                );
            });
            return res.status(200).json({ data: userArr, user: req.user.username });
        } catch (e) {
            res.sendStatus(404);
            console.log(e);
        }
    } else {
        try {
            const data = await users.findOne({ where: { uuid: req.user.uuid } });
            data.flag = true;
            data.save();
            return res.status(200).json(data);
        } catch (e) {
            console.log(e);
            return res.status(401);
        }
    }
});
manageRouter.put("/protected/update", authWall, async (req, res) => {
    var a = req.body;
    if (
        req.user.role === "su" ||
        (req.user.role === "m" && req.user.clearance >= a.round)
    ) {
        const entry = await users.findOne({ where: { uuid: req.body.uuid } });
        entry.status = a.status;
        entry.save().then(async () => {
            if (
                await eventlogger(
                    req.user,
                    `Changed selection status for ${a.username} to ${a.status}`
                )
            )
                return res.status(202).json({ message: "Changes have been saved" });
            else res.sendStatus(500).json({ success: "false" });
        });
    } else {
        return res.sendStatus(401).json({ success: "failed" });
    }
});

manageRouter.put("/protected/feedback", authWall, async (req, res) => {
    // var a = req.body;
    if (req.user.role === "su" || req.user.role === "m") {
        const entry = await users.findOne({ where: { uuid: req.body.uuid } });
        if (entry.feedback.length == 0) {
            let arr = [];
            arr.push(req.body.feedback);
            entry.feedback = arr;
        } else {
            let arr = [];
            entry.feedback.forEach((el) => {
                arr.push(el);
            });
            arr.push(req.body.feedback);
            entry.feedback = arr;
        }
        // console.log(entry.feedback);
        entry.save().then(async () => {
            if (await eventlogger(req.user, `Added feedback for ${entry.name}`))
                return res.status(202).json({ message: "Changes have been saved" });
            else res.sendStatus(500).json({ success: "false" });
        });
    } else {
        return res.sendStatus(401).json({ success: "failed" });
    }
});
manageRouter.put("/protected/changerole", authWall, async (req, res) => {
    if (req.user.role === "su") {
        const { uuid, role } = req.body;
        const details = await users.findOne({ where: { uuid: uuid } });
        details.role = role;
        details.save();
        console.log(details);
        if (
            await eventlogger(
                req.user,
                `changed the role for ${details.username} to ${role}`
            )
        )
            res.sendStatus(201).json({ success: "true" });
        else res.sendStatus(500).json({ success: "false" });
    } else {
        res.sendStatus(401).json({ success: "failed" });
    }
});
manageRouter.put("/protected/setclearance", authWall, async (req, res) => {
    if (req.user.role === "su") {
        const { uuid, clearance } = req.body;
        const details = await users.findOne({ where: { uuid: uuid } });
        details.clearance = clearance;
        await details.save();
        console.log(details);
        if (
            await eventlogger(
                req.user,
                `Set Clearance for ${details.username} to ${clearance}`
            )
        )
            res.sendStatus(201).json({ success: "true" });
        else res.sendStatus(500).json({ success: "false" });
    } else {
        res.sendStatus(401).json({ success: "failed" });
    }
});

manageRouter.post("/protected/pushround", authWall, async (req, res) => {
    if (req.user.role === "su") {
        let save = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname + "../../config/auditionConfig.json")
            )
        );
        save.round = save.round + 1;
        save.status = "ong";
        await roundmodel
            .findOne({ where: { roundNo: save.round } })
            .then(async (doc) => {
                if (!doc) {
                    res.sendStatus(400);
                } else {
                    save.time = doc.time;
                    if (await eventlogger(req.user, `Pushed Round ${save.round}`)) {
                        save = JSON.stringify(save);
                        fs.writeFileSync(
                            path.resolve(__dirname + "../../config/auditionConfig.json"),
                            save
                        );
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(500);
                    }
                }
            });
    } else {
        res.sendStatus(401);
    }
});

manageRouter.post("/protected/stopround", authWall, async (req, res) => {
    if (req.user.role === "su") {
        try {
            let save = JSON.parse(
                fs.readFileSync(
                    path.resolve(__dirname + "../../config/auditionConfig.json")
                )
            );
            save.round = save.round;
            save.status = "def";
            if (await eventlogger(req.user, `Stopped Round ${save.round}`)) {
                save = JSON.stringify(save);
                fs.writeFileSync(
                    path.resolve(__dirname + "../../config/auditionConfig.json"),
                    save
                );
                res.sendStatus(200);
            } else {
                res.sendStatus(500);
            }
        } catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(300);
    }
});

manageRouter.put("/protected/extendtime", authWall, async (req, res) => {
    if (req.user.role === "su") {
        let save = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname + "../../config/auditionConfig.json")
            )
        );
        if (save.status === "ong") {
            if (req.body.id === "all") {
                await users
                    .findAll({ where: { round: save.round } })
                    .then((document) => {
                        if (!document) {
                            res.sendStatus(404);
                        } else {
                            var mutabledoc = document;
                            mutabledoc.forEach(async (kid) => {
                                if (kid.role === "s") {
                                    if (kid.time < new Date().getTime())
                                        kid.time = new Date().getTime() + 600000 + 2000;
                                    else kid.time += 600000;
                                    console.log(kid);
                                    const kidDash = await users.findOne({
                                        where: { uuid: kid.uuid },
                                    });
                                    if (kidDash.time < new Date().getTime())
                                        kidDash.time = new Date().getTime() + 600000 + 2000;
                                    else kidDash.time += 600000;
                                    kidDash.save();
                                }
                            });
                        }
                    })
                    .then(async () => {
                        if (
                            await eventlogger(
                                req.user,
                                `Extended Time for everyone by 10 minutes`
                            )
                        )
                            res.sendStatus(202);
                        else res.sendStatus(500);
                    });
            } else {
                const kidItem = await users.findOne({ where: { uuid: req.body.id } });
                if (kidItem.time < new Date().getTime())
                    kidItem.time = new Date().getTime() + 600000 + 2000;
                else kidItem.time += 600000;
                kidItem.save().then(async () => {
                    if (
                        await eventlogger(
                            req.user,
                            `Extended Time for ${kidItem.name} by 10 minutes to ${new Date(
                                kidItem.time
                            ).toString.substring(0, 24)}`
                        )
                    )
                        res.sendStatus(202);
                    else res.sendStatus(500);
                });
            }
        } else res.sendStatus(401);
    } else res.sendStatus(401);
});
manageRouter.post("/protected/pushresult", authWall, async (req, res) => {
    if (req.user.role === "su") {
        let save = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname + "../../config/auditionConfig.json")
            )
        );
        var round = save.round;
        save = JSON.stringify({
            round: save.round,
            status: "res",
        });
        var csvobject = [];
        var rejected = "";
        var unevaluated = "";
        await users
            .findAll({
                where: {
                    status: {
                        [Op.or]: ["unevaluated", "review", "rejected"],
                    },
                    [Op.and]: [{ role: "s" }, { round: Number(round) }],
                },
            })
            .then(async (userdoc) => {
                console.log(userdoc);
                if (userdoc.length) {
                    fs.closeSync(
                        fs.openSync(
                            path.resolve(__dirname + `../../result/Result_${round}.csv`),
                            "w"
                        )
                    );
                    await users
                        .findAll({ where: { role: "s" } })
                        .then((doc) => {
                            doc.forEach(async (user) => {
                                if (
                                    user.status === "rejected" &&
                                    user.round === Number(round)
                                ) {
                                    rejected += user.email + ",";
                                } else if (
                                    user.status === "unevaluated" &&
                                    user.round === Number(round)
                                ) {
                                    csvobject.push(user);
                                    user.status = "unevaluated";
                                    user.round += 1;
                                    user.time = 0;
                                    user.save();
                                }
                            });
                        })
                        .then(async () => {
                            const csvWriter = createCsvWriter({
                                path: path.resolve(
                                    __dirname + `../../result/Result_${round}.csv`
                                ),
                                header: [
                                    { id: "name", title: "Name" },
                                    { id: "email", title: "Email" },
                                    { id: "phone", title: "Phone" },
                                ],
                            });

                            csvWriter
                                .writeRecords(csvobject)
                                .then(() =>
                                    console.log("The CSV file was written successfully")
                                );
                            const rejectedones = rejected.slice(0, -1);
                            console.log(rejectedones);
                            const rejectlist = {
                                subject: "Thank you for your participation.",
                                text: "<html>Hi there.<br/>We announce with a heavy heart that you will not be moving ahead in the audition process.<br/><br/>However, the GNU/Linux User's Group will always be there to help your every need to the best of our abilities.<br/>May The Source Be With You!<br/><br/>Thanking You,<br/>Yours' Sincerely,<br/>GNU/Linux Users' Group, NIT Durgapur.</html>",
                                list: rejectedones,
                            };
                            worker.postMessage(rejectlist);
                            /*sendMail(
                                              "Thank you for your participation.",
                                              "<html>Hi there.<br/>We announce with a heavy heart that you will not be moving ahead in the audition process.<br/><br/>However, the GNU/Linux User's Group will always be there to help your every need to the best of our abilities.<br/>May The Source Be With You!<br/><br/>Thanking You,<br/>Yours' Sincerely,<br/>GNU/Linux Users' Group, NIT Durgapur.</html>",
                                              rejectedones
                                          )*/
                            const results = [];
                            fs.createReadStream(
                                path.resolve(__dirname + `../../result/Result_${round}.csv`)
                            )
                                .pipe(csv())
                                .on("data", (data) => results.push(data))
                                .on("end", () => {
                                    results.forEach((doc2) => {
                                        sendMail(
                                            "Congratulations!",
                                            `<html>Hi <b>${doc2.Name}.</b><br/><br/>
                                            We are glad to inform you that you were shortlisted in <b>Round ${round}.</b><br/>
                                            You will be moving ahead in the audition process.<br/>
                                            Further details will be let known very soon.<br/><br/>
                                            Join our Whatsapp All in Group here: ${process.env.WHATSAPP} if you haven't joined yet.<br/><br/>
                                            All latest updates will come there first!<br/><br/>
                                            Make sure you join the GLUG ALL-IN server for the next rounds of the audition process.<br/>
                                            Join here: ${process.env.DISCORD}<br/><br/>
                                            Make sure that you set your server nick-name as your real name alongwith your complete roll number.<br/>
                                            If your name is ABCD and Roll number is 20XX800XX, your username should be ABCD_20XX800XX.<br/><br/>
                                            May The Source Be With You!🐧❤️<br/><br/>
                                            Thanking You,<br/>
                                            Your's Sincerely,<br/>
                                            <b>GNU/Linux Users' Group, NIT Durgapur.</b></html>`,
                                            doc2.Email
                                        );
                                    });
                                });
                        })
                        .then(async () => {
                            if (
                                await eventlogger(req.user, `Result pushed for round ${round}`)
                            )
                                return res.status(201).send({ status: true });
                            else res.sendStatus(500);
                        });
                    // fs.writeFileSync(path.resolve(__dirname + "../../config/auditionConfig.json"), save);
                } else {
                    res.status(200).send({ status: false });
                }
            });
    } else {
        res.sendStatus(401);
    }
});
manageRouter.get("/protected/getResult", authWall, async (req, res) => {
    console.log(req.user);
    if (req.user.dataValues.role == "su") {
        let save = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname + "../../config/auditionConfig.json")
            )
        );

        if (save.status === "res") {
            var result = [];
            users
                .findAll({
                    where: {
                        [Op.and]: [
                            { status: "unevaluated" },
                            { role: "s" },
                            { round: save.round },
                        ],
                    },
                })
                .then((doc) => {
                    doc.forEach((kid) => {
                        result.push(kid.username);
                    });
                })
                .then(() => {
                    res.status(200).send(result);
                });
        } else {
            var result = [];
            users
                .findAll({
                    where: {
                        [Op.and]: [
                            { status: "unevaluated" },
                            { role: "s" },
                            { round: save.round },
                        ],
                    },
                })
                .then((doc) => {
                    doc.forEach((kid) => {
                        result.push(kid.username);
                    });
                })
                .then(() => {
                    res.status(200).send(result);
                });
        }
    }
});
module.exports = manageRouter;
