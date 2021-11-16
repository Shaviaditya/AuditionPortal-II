'use strict';
const {
  Model
} = require('sequelize');
const roundmodel = require('./roundmodel');
module.exports = (sequelize, DataTypes) => {
  class question_set_model extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({roundmodel}) {
      // define association here
      question_set_model.belongsTo(roundmodel,{foreignKey:"roundId"})
    }
  };
  question_set_model.init({
    quesText: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roundId: {
      type: DataTypes.STRING,
      allowNull: false
    },  
    quesLink: {
      type: DataTypes.STRING,
      allowNull: true
    },
    quesType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    options: {
      type: DataTypes.STRING,
      allowNull: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'question_set_model',
  });
  return question_set_model;
};