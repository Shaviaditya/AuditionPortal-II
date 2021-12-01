/*
'use strict';
const {
  Model
} = require('sequelize');
const answermodel = require('./answermodel');
module.exports = (sequelize, DataTypes) => {
  class question_answered_model extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
    static associate({answermodel}) {
      // define association here
      question_answered_model.belongsTo(answermodel,{foreignKey:'qID'})
    }
  };
  question_answered_model.init({
    qid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qtype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ansLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'question_answered_model',
  });
  return question_answered_model;
};
*/

// import { sequelize } from ".";

module.exports = (sequelize, DataTypes) => {
  const question_answered_model = sequelize.define("question_answered_model", {
    connectID : {
      type: DataTypes.STRING,
      allowNull: false
    },
    qid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qtype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ansLink: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });
  return question_answered_model;
}