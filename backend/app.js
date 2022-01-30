const express = require('express')
const passport = require('passport');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const cookieSession = require('cookie-session');
let app = express();
let cors = require('cors')
const { router } = require('./routes/eventLogger')
const models = require('./models/index')
const { sequelize } = require('./models');
const { DataTypes } = require('sequelize');
require('dotenv').config();
const morgan = require('morgan')
let PORT = process.env.PORT;
// const pgtools = require('pgtools')
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/config/config.json')[env];
/*pgtools.createdb({
   user: config.username,
   password: config.password,
   port: 5432,
   host: 'localhost'
 }, config.database, function (err, res) {
   if (err) {
     console.error(err);
     process.exit(-1);
   }
   console.log(res);
});
*/ 

//Middlewares
app.use(express.json());
app.use(cors())
app.use(morgan('dev'))
app.use(cookieParser());
// app.use(session({ secret: 'my secret', cookie: { maxAge: 1200000 }, resave: true, saveUninitialized: true }));
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ["rohan"]
}))
app.use(passport.initialize())
app.use(passport.session());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({ Welcome: user });
})
// app.get('/getdata',passport.authenticate("jwt", { session: false }),(req,res)=>{
//     res.send({"data":req.user})
// })
app.use('/', router)
//Routes
require('./routes/authRoutes')(app, passport)
require('./routes/roundRoutes')(app, passport)
require('./routes/manageRoutes')(app, passport)
require('./routes/superuser')(app, passport)
require('./routes/student')(app, passport)

models.sequelize.sync().then(async () => {
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