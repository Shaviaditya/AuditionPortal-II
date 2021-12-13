const express = require('express')
const passport = require('passport');
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
app.use(session({ secret: 'my secret', cookie: { maxAge: 1200000 } ,resave: true, saveUninitialized: true }));
app.use(passport.initialize())
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/',(req,res)=> {
    res.status(200).json({Welcome : user});
})


//Routes
require('./routes/authRoutes')(app, passport)
require('./routes/roundRoutes')(app,passport)
// require('./routes/eventLogger')(app)
require('./routes/manageRoutes')(app, passport)
require('./routes/superuser')(app,passport)
require('./routes/student')(app,passport)


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