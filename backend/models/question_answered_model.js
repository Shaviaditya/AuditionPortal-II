const { DataTypes } = require('sequelize')
const users = require('./users')
module.exports = (sequelize) => {
  const question_answered_model = sequelize.define("question_answered_model", {
    qid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qtype: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ansLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roundInfo: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
    // userUuid: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   references:{
    //     model: users,
    //     key: 'uuid',
    //     onDele 
    //   }
    // }
  });
  return question_answered_model;
}