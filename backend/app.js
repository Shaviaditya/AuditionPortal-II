const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport');
const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
const session = require('express-session')
let app = express();
const { sequelize } = require('./models');
require('dotenv').config();
let PORT = process.env.PORT;

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: 'my secret', cookie: { maxAge : 1200000 } })); 
app.use(passport.initialize())
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//Routes
require('./routes/authRoutes')(app, passport)


//server call
app.listen(PORT, async () => {
    console.log(`Server up on http://localhost:${PORT}`)
    sequelize.authenticate()
    console.log(`Database Connected`)
})
