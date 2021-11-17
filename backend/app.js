const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport');
const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
const session = require('express-session')
let app = express();
const models = require('./models/index')
const { sequelize } = require('./models');
require('dotenv').config();
let PORT = process.env.PORT;

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: 'my secret', cookie: { maxAge: 1200000 } }));
app.use(passport.initialize())
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//Routes
require('./routes/authRoutes')(app, passport)

const {
    models: {
        question_set_model,
        roundmodel
    }
} = sequelize;


/*
app.post('/setRound', async (req, res) => {
    try {
        const { round, time, quesText, quesLink, quesType, options, score } = req.body;
        await roundmodel.create({
            roundNo: round,
            time: time,
        });
        const quiz = await question_set_model.create({
            roundId: round,
            quesText: quesText,
            quesLink: quesLink,
            quesType: quesType,
            options: options,
            score: score,
        });
        res.status(201).json(quiz);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})

app.get('/getrounds', async (req, res) => {
    const rounds = await roundmodel.findAll({ include: [{ model: question_set_model }] });
    res.status(201).json(rounds);
})
*/


//server call
models.sequelize.sync().then(() => {
    try {
        sequelize.authentication;
        console.log(`Database Connected`)
        app.listen(PORT, async () => {
            console.log(`Server up on http://localhost:${PORT}`)
        })
    } catch (err) {
        console.log(err);
    }
})