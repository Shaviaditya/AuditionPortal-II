'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "score" from table "question_set_models"
 *
 **/

var info = {
    "revision": 2,
    "name": "noname",
    "created": "2022-02-05T20:27:34.047Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "removeColumn",
    params: ["question_set_models", "score"]
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
