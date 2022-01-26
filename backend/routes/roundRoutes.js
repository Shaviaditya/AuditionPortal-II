const { sequelize, models } = require("../models/index");
const worker_connect = require("./controller");
require("dotenv").config();
const {
  models: { roundmodel, question_set_model, users },
} = sequelize;
const express = require("express");
const roundsRouter = express.Router();
const { authWall } = require("../middleware/authpass");
const {eventlogger} = require("./eventLogger")
roundsRouter.post("/addRound", authWall, async (req, res) => {
  if (req.user.role === "m" || req.user.role === "su") {
    const { questions, time } = req.body;
    await roundmodel.findAll().then((doc) => {
      if (!doc) presetRounds = 0;
      else presetRounds = doc.length;
    });
    await roundmodel
      .create({ roundNo: presetRounds + 1, time: time })
      .then(async () => {
        questions.forEach((element) => {
          const { quesText, ImageLink, AudioLink, quesType, options, score } = element;
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
        if (await eventlogger(req.user, `added Round ${presetRounds + 1}`)) {
          return res.status(400).json({ success: false });
        } else {
          return res.status(201).json({ success: true });
        }
      });
  } else {
    res.status(401).json({ status: "Unauthorized!" });
  }
});

// Checked!
roundsRouter.get("/getRounds", authWall, async (req, res) => {
  if (req.user.role == "m" || req.user.role == "su") {
    const data = await roundmodel.findAll({ include: question_set_model });
    if (data) {
      res.status(201).json(data);
    } else {
      res.status(400).json({ success: "false" });
    }
  } else {
    return res.sendStatus(401);
  }
});

// Checked!
roundsRouter.get("/getQuestions", authWall, async (req, res) => {
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
roundsRouter.post("/addQuestion", authWall, async (req, res) => {
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
roundsRouter.put("/editQuestion/:id", authWall, async (req, res) => {
  if (req.user.role === "su" || res.user.role === "m") {
    const Qid = req.params.id;
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
        console.log(doc);
      });
    res.sendStatus(200).json({ "Question Edited": "Done" });
  } else {
    res.sendStatus(401).json({ Access: "Unauthorized" });
  }
});

roundsRouter.put("/updateRound", authWall, async (req, res) => {
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
    res.sendStatus(200).json({ "Question Edited": "Done" });
  } else {
    res.sendStatus(401).json({ Access: "Unauthorized" });
  }
});

// Checked!
roundsRouter.delete("/removeQuestion/:id", authWall, async (req, res) => {
  if (req.user.role == "su" || req.user.role == "m") {
    try {
      const uuid = req.params.id;
      const question = await question_set_model.findOne({
        where: {
          quesId: uuid,
        },
      });
      await question.destroy();
      return res.status(200).json({ delete: true });
    } catch (err) {
      return res.status(500).json(err);
    }
  }
});

roundsRouter.delete("/removeRound", authWall, async (req, res) => {
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
roundsRouter.delete("/removeUser", authWall, async (req, res) => {
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
module.exports = roundsRouter;
