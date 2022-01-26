const passport = require('passport')
require('../passport/passportgithub')(passport)
require('../passport/passportgoogle')(passport)
require('../passport/passportjwt')(passport)
const authWall = passport.authenticate("jwt", { session: false });
module.exports = {
    authWall
}