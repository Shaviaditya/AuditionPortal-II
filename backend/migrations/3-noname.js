'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "score" to table "question_set_models"
 *
 **/

var info = {
    "revision": 3,
    "name": "noname",
    "created": "2022-02-05T21:17:36.184Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "question_set_models",
        "score",
        {
            "type": Sequelize.INTEGER,
            "field": "score",
            "allowNull": true
        }
    ]
}];

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
