const { sequelize } = require("../models");
const eventmodel = require("../models/eventmodel");
const multer = require('multer');
const upload = require('../services/upload')
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

    function sendEventsToAll(newLog) {
        clients.forEach(c => c.res.write(`data: [${JSON.stringify(newLog)}]\n\n`))
        return true;
    }

    const eventlogger = async (user, message) => {
        var newLog = await eventmodel.create({
            user: user.username + '(' + user.role + ')',
            time: (new Date()).toString().substring(0, 24),
            message: message
        }).then(() => {
            return sendEventsToAll(newLog);
        })
    }
    app.get('/events', eventHandler);

    app.post('/upload', upload.single("file"), (req, res) => {
        if (req.file && req.file.path) {
            return res.status(200).json({ link: req.file.path });
        }
        else {
            return res.status(200).json({ link: false });
        }
    })

    //Upload File work goes here
}
