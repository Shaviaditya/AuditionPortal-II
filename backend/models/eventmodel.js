const { Sequelize, DataTypes} = require("sequelize");
const { sequelize } = require(".");
module.exports = (sequelize, DataTypes) => {
    const eventmodel = sequelize.define('eventmodel',{
        user:{
            type: DataTypes.STRING,
            allowNull: false
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message:{
            type: DataTypes.STRING,
            allowNull: false
        }
    })
}