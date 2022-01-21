const { DataTypes } = require('sequelize')
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
  });
  return question_answered_model;
}