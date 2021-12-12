const { DataTypes} = require("sequelize");
module.exports = (sequelize) => {
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
    return eventmodel;
}