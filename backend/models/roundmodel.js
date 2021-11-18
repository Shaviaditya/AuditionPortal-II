/*
'use strict';
const {
  Model
} = require('sequelize');
const question_set_model = require('./question_set_model');
module.exports = (sequelize, DataTypes) => {
  class roundmodel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
    static associate({question_set_model}) {
      // define association here
      this.hasMany(question_set_model,{foreignKey:'roundId'})
    }
  };
  roundmodel.init({
    roundNo:{
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    time:{
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'roundmodel',
  });
  return roundmodel;
};
*/

module.exports = (sequelize, DataTypes) => {
  const roundmodel = sequelize.define("roundmodel",{
    roundNo:{
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    time:{
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
  // roundmodel.associate = (models) => {
  //   roundmodel.hasMany(models.question_set_model,{foreignKey:'roundId'})
  // }
  return roundmodel;
}
