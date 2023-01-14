'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "users", deps: []
 * createTable "roundmodels", deps: []
 * createTable "eventmodels", deps: []
 * createTable "question_set_models", deps: [roundmodels]
 * createTable "question_answered_models", deps: [users]
 *
 **/

var info = {
    "revision": 1,
    "name": "noname",
    "created": "2023-01-13T22:58:51.447Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "users",
            {
                "uuid": {
                    "type": Sequelize.UUID,
                    "field": "uuid",
                    "primaryKey": true,
                    "defaultValue": Sequelize.UUIDV4
                },
                "username": {
                    "type": Sequelize.STRING,
                    "field": "username",
                    "allowNull": false
                },
                "email": {
                    "type": Sequelize.STRING,
                    "field": "email",
                    "unique": true,
                    "allowNull": false
                },
                "password": {
                    "type": Sequelize.STRING,
                    "field": "password",
                    "allowNull": false
                },
                "role": {
                    "type": Sequelize.STRING,
                    "field": "role",
                    "defaultValue": "s",
                    "allowNull": true
                },
                "status": {
                    "type": Sequelize.STRING,
                    "field": "status",
                    "defaultValue": "unevaluated",
                    "allowNull": true
                },
                "flag": {
                    "type": Sequelize.BOOLEAN,
                    "field": "flag",
                    "defaultValue": false
                },
                "clearnace": {
                    "type": Sequelize.INTEGER,
                    "field": "clearnace",
                    "allowNull": true
                },
                "mode": {
                    "type": Sequelize.STRING,
                    "field": "mode",
                    "defaultValue": "normal",
                    "allowNull": true
                },
                "round": {
                    "type": Sequelize.INTEGER,
                    "field": "round",
                    "defaultValue": 1,
                    "allowNull": false
                },
                "time": {
                    "type": Sequelize.BIGINT,
                    "field": "time",
                    "defaultValue": 0,
                    "allowNull": false
                },
                "feedback": {
                    "type": Sequelize.ARRAY(Sequelize.STRING),
                    "field": "feedback",
                    "allowNull": true
                },
                "phone": {
                    "type": Sequelize.BIGINT,
                    "field": "phone",
                    "allowNull": true
                },
                "lastUser": {
                    "type": Sequelize.STRING,
                    "field": "lastUser"
                },
                "roll": {
                    "type": Sequelize.STRING,
                    "field": "roll",
                    "allowNull": true
                },
                "profilebool": {
                    "type": Sequelize.BOOLEAN,
                    "field": "profilebool",
                    "defaultValue": false,
                    "allowNull": false
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "roundmodels",
            {
                "roundNo": {
                    "type": Sequelize.INTEGER,
                    "field": "roundNo",
                    "primaryKey": true,
                    "unique": true,
                    "allowNull": false
                },
                "time": {
                    "type": Sequelize.INTEGER,
                    "field": "time",
                    "allowNull": false
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "eventmodels",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "user": {
                    "type": Sequelize.STRING,
                    "field": "user",
                    "allowNull": false
                },
                "time": {
                    "type": Sequelize.STRING,
                    "field": "time",
                    "allowNull": false
                },
                "message": {
                    "type": Sequelize.STRING,
                    "field": "message",
                    "allowNull": false
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "question_set_models",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "quesId": {
                    "type": Sequelize.UUID,
                    "field": "quesId",
                    "defaultValue": Sequelize.UUIDV4
                },
                "quesText": {
                    "type": Sequelize.STRING,
                    "field": "quesText",
                    "allowNull": false
                },
                "ImageLink": {
                    "type": Sequelize.STRING,
                    "field": "ImageLink",
                    "allowNull": true
                },
                "AudioLink": {
                    "type": Sequelize.STRING,
                    "field": "AudioLink",
                    "allowNull": true
                },
                "quesType": {
                    "type": Sequelize.STRING,
                    "field": "quesType",
                    "allowNull": false
                },
                "options": {
                    "type": Sequelize.ARRAY(Sequelize.STRING),
                    "field": "options",
                    "allowNull": true
                },
                "score": {
                    "type": Sequelize.INTEGER,
                    "field": "score",
                    "allowNull": true
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "roundmodelRoundNo": {
                    "type": Sequelize.INTEGER,
                    "field": "roundmodelRoundNo",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "roundmodels",
                        "key": "roundNo"
                    },
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "question_answered_models",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "qid": {
                    "type": Sequelize.STRING,
                    "field": "qid",
                    "allowNull": false
                },
                "answer": {
                    "type": Sequelize.ARRAY(Sequelize.STRING),
                    "field": "answer",
                    "allowNull": true
                },
                "qtype": {
                    "type": Sequelize.STRING,
                    "field": "qtype",
                    "allowNull": true
                },
                "score": {
                    "type": Sequelize.INTEGER,
                    "field": "score",
                    "allowNull": true
                },
                "ansLink": {
                    "type": Sequelize.STRING,
                    "field": "ansLink",
                    "allowNull": true
                },
                "roundInfo": {
                    "type": Sequelize.INTEGER,
                    "field": "roundInfo",
                    "allowNull": false
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "userUuid": {
                    "type": Sequelize.UUID,
                    "field": "userUuid",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "users",
                        "key": "uuid"
                    },
                    "allowNull": false
                }
            },
            {}
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
