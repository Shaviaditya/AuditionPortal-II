const { sequelize } = require("../models");
const eventmodel = require("../models/eventmodel");

const { models: { eventmodel } } = sequelize;
require('dotenv').config();
module.exports = (app) => {
    let clients = [];
    const eventHandler = async (req, res, next) => {
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        res.writeHead(200, headers);
        await eventmodel.findAll().then(doc => {
            if (doc) {
                res.write(`data: ${JSON.stringify(document)}\n\n`);
            }
        })
        const clientId = Date.now();
        const newClient = {
            id: clientId,
            res
        };
        clients.push(newClient);
        req.on('close', () => {
            console.log(`${clientId} Connection closed`);
            clients = clients.filter(c => c.id !== clientId);
        });
    }
    const sendEventsTOAll = (user, message) => {
        var newLog = await eventmodel.create({
            user: user.username + '(' + user.role + ')',
            time: (new Date()).toString().substring(0, 24),
            message: message
        }).then(()=>{
            return sendEventsTOAll(newLog);
        })
    }
    app.get('/events', eventHandler);

    //Upload File work goes here
}
