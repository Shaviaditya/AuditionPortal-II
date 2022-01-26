const express = require('express')
const passport = require('passport');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const worker_connect = require('./routes/controller')
let app = express();
const { router } = require('./routes/eventLogger')
const models = require('./models/index')
const { sequelize } = require('./models');
require('dotenv').config();
let PORT = process.env.PORT;
const roundsRouter = require('./routes/roundRoutes');
const authRouter = require('./routes/authRoutes');
const manageRouter = require('./routes/manageRoutes')
const studentRouter = require('./routes/student')
const morgan = require('morgan')

//Middlewares
app.use(morgan('dev'))
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: 'my secret', cookie: { maxAge: 1200000 }, resave: true, saveUninitialized: true }));
app.use(passport.initialize())
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({ Welcome: user });
})

app.use('/', router)
//Routes

app.use(roundsRouter)
app.use('/auth',authRouter)
app.use('/protected',manageRouter)
app.use('/student',studentRouter)
require('./routes/superuser')(app, passport)


models.sequelize.sync().then(async () => {
    try {
        sequelize.authentication;
        console.log(`Database Connected`)
        // if (process.env.ENABLE_WORKERS === '1') {
        //     const options = { minWorkers: 'max' }
        //     await worker_connect.init(options);
        // }
        app.listen(PORT, async () => {
            console.log(`Server up on http://localhost:${PORT}`)
        })
    } catch (err) {
        console.log(err);
    }
})