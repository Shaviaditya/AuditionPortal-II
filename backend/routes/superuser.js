const { sequelize } = require("../models");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { Op } = require("sequelize");
const { eventlogger } = require("./eventLogger");
const { isMainThread, Worker } = require("worker_threads");
require("dotenv").config();
const {
  models: { users, roundmodel, question_answered_model },
} = sequelize;
// const workers = worker_connect.get();
module.exports = (app, passport) => {
  require("../passport/passportjwt")(passport);
  require("../passport/passportgoogle")(passport);
  require("../passport/passportgithub")(passport);
  const authPass = passport.authenticate("jwt", {
    session: false,
  });
  app.put("/protected/changerole", authPass, async (req, res) => {
    if (req.user.role === "su") {
      const { uuid, role } = req.body;
      const details = await users.findOne({ where: { uuid: uuid } });
      details.role = role;
      details.save();
      console.log(details);
      // const w1 = worker_connect.get();
      if ((await eventlogger(req.user,`changed the role for ${details.username} to ${role}`))
      )
        res.sendStatus(201).json({ success: "true" });
      else res.sendStatus(500).json({ success: "false" });
    } else {
      res.sendStatus(401).json({ success: "failed" });
    }
  });

  app.put("/protected/setclearance", authPass, async (req, res) => {
    if (req.user.role === "su") {
      const { uuid, clearance } = req.body;
      const details = await users.findOne({ where: { uuid: uuid } });
      details.clearance = clearance;
      await details.save();
      console.log(details);
      // const worker2 = worker_connect.get();
      if (
        (await eventlogger(
          req.user,
          `Set Clearance for ${details.username} to ${clearance}`
        ))
      )
        res.sendStatus(201).json({ success: "true" });
      else res.sendStatus(500).json({ success: "false" });
    } else {
      res.sendStatus(401).json({ success: "failed" });
    }
  });

  app.post("/protected/pushround", authPass, async (req, res) => {
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
            // const { eventlog } = worker_connect.get();
            if ((await eventlogger(req.user, `Pushed Round ${save.round}`))) {
              // eventlogger(req.user, `Pushed Round ${save.round}`)
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

  app.post("/protected/stopround", authPass, async (req, res) => {
    if (req.user.role === "su") {
      try {
        let save = JSON.parse(
          fs.readFileSync(
            path.resolve(__dirname + "../../config/auditionConfig.json")
          )
        );
        save.round = save.round;
        save.status = "def";
        // const { eventlog } = worker_connect.get();
        if ((await eventlogger(req.user, `Stopped Round ${save.round}`))) {
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

  app.put("/protected/extendtime", authPass, async (req, res) => {
    if (req.user.role === "su") {
      let save = JSON.parse(
        fs.readFileSync(
          path.resolve(__dirname + "../../config/auditionConfig.json")
        )
      );
      if (save.status === "ong") {
        if (req.body.uuid === "all") {
          await users
            .findAll({ where: { round: save.round } })
            .then((document) => {
              if (!document) {
                res.sendStatus(404);
              } else {
                var mutabledoc = document;
                mutabledoc.forEach(async (kid) => {
                  if (kid.role === "s") {
                    if (kid.time < new Date().getTime()){
                      kid.time = new Date().getTime() + 600000 + 2000;
                    } else { 
                      kid.time = Number(kid.time) + 600000;
                    }
                    console.log(kid);
                    kid.save();
                  }
                });
              }
            })
            .then(async () => {
              // const worker4 = worker_connect.get()
              if (
                (await eventlogger(
                  req.user,
                  `Extended Time for everyone by 10 minutes`
                ))
              )
                res.sendStatus(202);
              else res.sendStatus(500);
            });
        } else {
          const kidItem = await users.findOne({ where: { uuid: req.body.uuid } });
          if (kidItem.time < new Date().getTime()){
            kidItem.time = new Date().getTime() + 600000 + 2000;
          }
          else { 
            kidItem.time = Number(kidItem.time) + 600000;
          }
          kidItem.save().then(async () => {
            if (
              (await eventlogger(
                req.user,
                `Extended Time for ${kidItem.username} by 10 minutes to ${new Date(
                  kidItem.time
                ).toString().substring(0, 24)}`
              ))
            )
              res.sendStatus(202);
            else res.sendStatus(500);
          });
        }
      } else res.sendStatus(401);
    } else res.sendStatus(401);
  });

  app.post("/protected/pushresult", authPass, async (req, res) => {
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
      let datadump;
      var rejected = "";
      var unevaluated = "";
      await fs.promises.writeFile(
        path.resolve(__dirname + "../../config/auditionConfig.json"),
        save
      );
      await users
        .findAll({
          where: {
            status: {
              [Op.or]: ["selected", "rejected"],
            },
            [Op.and]: [{ role: "s" }, { round: Number(round) }],
          },
        })
        .then(async (userdoc) => {
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
                    user.status === "selected" &&
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
                let csvWriter = createCsvWriter({
                  path: path.resolve(
                    __dirname + `../../result/Result_${round}.csv`
                  ),
                  header: [
                    { id: "username", title: "Name" },
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
                let worker;
                if (isMainThread) {
                  worker = new Worker(
                    path.resolve(__dirname + "../../services/reportSender.js")
                  );
                  worker.on("message", (data) => {
                    console.log("Done", data);
                  });
                  worker.on("error", (data) => {
                    console.log("Error", data);
                  });
                  worker.on("exit", (data) => {
                    console.log("Exit", data);
                  });
                }
                var subject = "Thank you for your participation.";
                var text =
                  "<html>Hi there.<br/>We announce with a heavy heart that you will not be moving ahead in the audition process.<br/><br/>However, the GNU/Linux User's Group will always be there to help your every need to the best of our abilities.<br/>May The Source Be With You!<br/><br/>Thanking You,<br/>Yours' Sincerely,<br/>GNU/Linux Users' Group, NIT Durgapur.</html>";
                var to = rejectedones;
                const data = {
                  subject: subject,
                  text: text,
                  list: to,
                };
                worker.postMessage(data);
                // const worker_Thread = worker_connect.get()
                // worker_Thread.mailing(subject,text,to);
                const results = [];
                fs.createReadStream(
                  path.resolve(__dirname + `../../result/Result_${round}.csv`)
                )
                  .pipe(csv())
                  .on("data", (data) => results.push(data))
                  .on("end", () => {
                    results.forEach((doc2) => {
                      const maildata = {
                        subject: "Congratulations!",
                        text: `<html>Hi <b>${doc2.Name}.</b><br/><br/>
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
                        list: doc2.Email,
                      };
                      worker.postMessage(maildata);
                    });
                  });
              })
              .then(async () => {
                // const { eventlog } = worker_connect.get();
                if (
                  (await eventlogger(
                    req.user,
                    `Result pushed for round ${round}`
                  ))
                ) {
                  // console.log(save)
                  // const writeFilePromisified = util.promisify(fs.writeFile)
                  res.status(201).send({ status: true });
                } else {
                  res.sendStatus(500);
                }
              });
          } else {
            res.status(200).send({ status: false });
          }
        });
    } else {
      res.sendStatus(401);
    }
  });

  app.post("/profile",authPass,async(req,res) => {
    await users.findOne({
      where:{
        uuid:req.user.uuid
      }
    }).then((doc) => {
      if(doc){
        doc.roll = req.body.roll,
        doc.phone = req.body.phone,
        doc.profilebool = true
        doc.save()
        res.sendStatus(202)
      } else {
        res.sendStatus(404)
      }
    }) 
  })

  app.get("/profile", authPass, async (req, res) => {
    // if (req.user.role === "s") {
      
    // }
    await users.findOne({ where: { uuid: req.user.uuid } }).then((doc) => {
      res.status(200).json({
        phone: doc.phone,
        roll: doc.roll,
        profilebool: doc.profilebool,
      });
    });
  });

  app.get("/getResult", authPass, async (req, res) => {
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
                { round: save.round + 1 },
              ],
            },
          })
          .then(async (doc) => {
            await Promise.all(
              doc.map((kid) => {
                return result.push(kid.username);
              })
            );
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
          .then(async (doc) => {
            await Promise.all(
              doc.map((kid) => {
                return result.push(kid.username);
              })
            );
          })
          .then(() => {
            res.status(200).send(result);
          });
      }
    }
  });

  app.get("/auditionstatus", (req, res) => {
    res.sendFile(path.join(__dirname + "../../config/auditionConfig.json"));
  });

  app.get("/datadump", authPass, async (req, res) => {
    if(req.user.role==="su"){
      await users.findAll().then((doc) => {
        fs.closeSync(
          fs.openSync(path.resolve(__dirname + `../../data.csv`), "w")
        );
        let csvWriter = createCsvWriter({
          path: path.resolve(__dirname + `../../data.csv`),
          header: [
            { id: "username", title: "Name" },
            { id: "email", title: "Email" },
            { id: "phone", title: "Phone" },
          ],
        });
        csvWriter
          .writeRecords(doc)
          .then(() => console.log("The CSV file was written successfully"))
      });
      res.header('Content-Type', 'text/csv');
      res.attachment('data.csv');
      return res.send(fs.createReadStream(
        path.resolve(__dirname + `../../data.csv`)
      ).pipe(res));
    } else {
      res.sendStatus(401)
    }
  })
  app.get('/result',authPass,async(req,res) => {
    let save = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname + "../../config/auditionConfig.json")
      )
    );
    if(save.status==="res" && save.round>0){
      const data = await users.findAll({
        where:{
          [Op.and]:[
            {status:"unevaluated"},
            {round: save.round+1}
          ]
        }
      })
      res.send(data)
    } else {
      res.sendStatus(404)
    }
  })
  // Beta Testing Route
  app.put("/timereset", authPass, async(req,res) => {
    if(req.user.role === "su"){
      await users.findAll().then((doc) => {
        doc.forEach((user)=>{
          user.round = 1;
          user.time = 0;
          user.save();
        })
      })
      res.sendStatus(200)
    } else {
      res.sendStatus(401)
    }
  })
  app.put("/upgrade/:id", authPass, async (req, res) => {
    let id = req.params.id;
    if (req.user.role === "su") {
      users
        .findOne({
          where: {
            uuid: id,
          },
        })
        .then((doc) => {
          doc.round = 1;
          doc.save();
          res.sendStatus(201);
        });
    }
  });
  app.put("/reject/:id", authPass, async (req, res) => {
    let id = req.params.id;
    if (req.user.role === "su") {
      users
        .findOne({
          where: {
            uuid: id,
          },
        })
        .then((doc) => {
          if (doc.status === "rejected") {
            doc.status = "unevaluated";
          } else {
            doc.status = "rejected";
          }
          doc.save();
          res.sendStatus(201);
        });
    }
  });
};
