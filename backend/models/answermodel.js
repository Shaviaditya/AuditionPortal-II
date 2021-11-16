'use strict';
const {
  Model
} = require('sequelize');
const question_answered_model = require('./question_answered_model');
const dashmodel = require('./dashmodel');
module.exports = (sequelize, DataTypes) => {
  class answermodel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({question_answered_model,dashmodel}) {
      // define association here
      this.hasMany(question_answered_model,{ foreignKey: 'qID', as: 'questions'})
      // answermodel.belongsTo(dashmodel,{foreignKey:'ansID'})
    }
  };
  answermodel.init({
    roundNo: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'answermodel',
  })
  return answermodel;
};