// All routes tested working fine!
const { sequelize, models } = require("../models/index");
const { eventlogger } = require("./eventLogger");
require("dotenv").config();
const {
  models: { roundmodel, question_set_model, users },
} = sequelize;
module.exports = (app, passport) => {
  require("../passport/passportjwt")(passport);
  require("../passport/passportgoogle")(passport);
  require("../passport/passportgithub")(passport);
  // Round Routes
  const authWall = passport.authenticate("jwt", { session: false });
  // Checked!
  app.post("/addRound", authWall, async (req, res) => {
    if (req.user.role == "m" || req.user.role == "su") {
      var presetRounds = 0;
      await roundmodel.findAll().then((doc) => {
        if (!doc) presetRounds = 0;
        else presetRounds = doc.length;
      });
      const { questions, time } = req.body;
      console.log(questions);
      await roundmodel
        .create({ roundNo: presetRounds + 1, time: time })
        .then(async (roundins) => {
          questions.forEach((element) => {
            const { quesText, ImageLink, AudioLink, quesType, options, score } =
              element;
            question_set_model.create({
              quesText: quesText,
              ImageLink: ImageLink,
              AudioLink: AudioLink,
              quesType: quesType,
              options: options,
              score: score,
              roundmodelRoundNo: presetRounds + 1,
            });
          });
          // const workers = worker_connect.get();
          const data = {
            user: req.user,
            msg: `added Round ${presetRounds + 1}`,
          };
          if (await eventlogger(data.user,data.msg)) {
            return res.status(201).json({ success: true });
          } else {
            return res.status(400).json({ success: false });
          }
        });
    } else {
      return res.status(401);
    }
  });

  // Checked!
  app.get("/getRounds", authWall, async (req, res) => {
    if (req.user.role == "m" || req.user.role == "su") {
      let ques_arr = [];
      await roundmodel
        .findAll({ include: question_set_model })
        .then(async (roundinfo) => {
          if (roundinfo) {
            res.status(201).json(roundinfo);
          } else {
            res.status(400).json({ success: "false" });
          }
        });
    } else {
      return res.sendStatus(401);
    }
  });

  // Checked!
  app.get("/getQuestions", authWall, async (req, res) => {
    if (req.user.role == "m" || req.user.role == "su") {
      await question_set_model.findAll().then(async (quizinfo) => {
        if (roundinfo) {
          res.status(201).json(quizinfo);
        } else {
          res.status(400).json({ success: "false" });
        }
      });
    } else {
      return res.sendStatus(401);
    }
  });

  // Checked!
  app.post("/addQuestion", authWall, async (req, res) => {
    // Just add Round Number to check add new question.
    if (req.user.role == "su" || req.user.role == "m") {
      const {
        roundNo,
        quesText,
        ImageLink,
        AudioLink,
        quesType,
        options,
        score,
      } = req.body;
      roundmodel.findOne({ where: { roundNo: roundNo } }).then((doc) => {
        question_set_model.create({
          quesText: quesText,
          ImageLink: ImageLink,
          AudioLink: AudioLink,
          quesType: quesType,
          options: options,
          score: score,
          roundmodelRoundNo: roundNo,
        });
      });
      await question_set_model
        .findAll({ where: { roundmodelRoundNo: roundNo } })
        .then((doc) => {
          if (doc) {
            return res.status(201).json({ success: true });
          } else {
            return res.status(400).json({ success: false });
          }
        });
    } else {
      return res.sendStatus(401);
    }
  });
  // Edit Question
  app.put("/editQuestion", authWall, async (req, res) => {
    if (req.user.role === "su" || res.user.role === "m") {
      const Qid = req.body.quesId;
      await question_set_model
        .findOne({ where: { quesId: Qid } })
        .then(async (doc) => {
          const { quesText, ImageLink, AudioLink, quesType, options, score } =
            req.body;
          doc.quesText = quesText;
          doc.ImageLink = ImageLink;
          doc.AudioLink = AudioLink;
          doc.quesType = quesType;
          doc.options = options;
          doc.score = score;
          await doc.save();
        });
      return res.sendStatus(200)
    } else {
      return res.sendStatus(401)
    }
  });

  app.put("/updateRound", authWall, async (req, res) => {
    if (req.user.role === "su" || res.user.role === "m") {
      const { time, questions, roundNo } = req.body;
      await roundmodel
        .findOne({ where: { roundNo: roundNo } })
        .then(async (doc) => {
          doc.time = time;
          await doc.save();
          console.log(doc);
        });
      questions.forEach(async (e) => {
        const {
          quesId,
          quesText,
          ImageLink,
          AudioLink,
          quesType,
          options,
          score,
        } = e;
        // console.log(quesId);
        await question_set_model
          .findOne({
            where: {
              quesId: quesId,
            },
          })
          .then(async (doc) => {
            if (doc) {
              doc.quesText = quesText;
              doc.ImageLink = ImageLink;
              doc.AudioLink = AudioLink;
              doc.quesType = quesType;
              doc.options = options;
              doc.score = score;
              await doc.save();
            } else {
              question_set_model.create({
                quesText: quesText,
                ImageLink: ImageLink,
                AudioLink: AudioLink,
                quesType: quesType,
                options: options,
                score: score,
              });
            }
          });
      });
      res.status(200).json({ "Question Edited": "Done" });
    } else {
      res.status(401).json({ Access: "Unauthorized" });
    }
  });

  // Checked!
  app.delete("/removeQuestion", authWall, async (req, res) => {
    console.log(req.user);
    if (req.user.role === "su" || req.user.role === "m") {
      const qid = req.body.quesId;
        const question = await question_set_model.findOne({
          where: {
            quesId: qid,
          },
        });
        question.destroy();
        res.status(200).json({ delete: true });
    } else {
      res.sendStatus(401)
    }
  });

  app.delete("/removeRound", authWall, async (req, res) => {
    if (req.user.role == "su" || req.user.role == "m") {
      const getRoundInfo = req.body.roundNo;
      console.log(getRoundInfo);
      try {
        const round = await roundmodel.findOne({
          where: {
            roundNo: getRoundInfo,
          },
        });
        await round.destroy();
        return res.status(200).json({ delete: true });
      } catch (err) {
        console.log(err);
        return res.status(500).json(err);
      }
    }
  });

  // Just a test route to remove any user...
  app.delete("/removeUser", authWall, async (req, res) => {
    if (req.user.role == "su") {
      const getRoundInfo = req.body.uuid;
      // console.log(getRoundInfo)
      try {
        const round = await users.findOne({
          where: {
            uuid: getRoundInfo,
          },
        });
        await round.destroy();
        return res.status(200).json({ delete: true });
      } catch (err) {
        console.log(err);
        return res.status(500).json(err);
      }
    }
  });
};
