const workerpool = require('workerpool');
const { eventlogger } = require('./eventLogger')
const { sendMail } = require('../services/reportSender')
// Functions
const eventlog = (p1,p2) => {
    return eventlogger(p1,p2);
}
const mailing = (p1,p2,p3) => {
    return sendMail(p1,p2,p3);
}
workerpool.worker({
    //Functions names
    eventlog,
    mailing
})