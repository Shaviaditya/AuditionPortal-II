'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class dash extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  dash.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "unevaluated",
      allowNull:true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "s"
    },
    round: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 1,
    },
    time: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    feedback: {
      type: DataTypes.ARRAY,
      allowNull: true,
    },
    lastUser: {
      type:DataTypes.STRING,
    },
    phone: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    roll: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilebool: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'dash',
  });
  const answerSchema = sequelize.define('answerSchema',{
    roundNo:{
      type: DataTypes.NUMBER,
      allowNull: false,
    },
  });
  const questionStore = sequelize.define('questionStore',{
    qid:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    qtype:{
      type: DataTypes.STRING,
      allowNull: false, 
    },
    score:{
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    ansLink:{
      type: DataTypes.STRING,
      allowNull: true,
    }
  });
  dash.hasOne(answerSchema,{
    foreignKey:{
      type: DataTypes.UUID,
      allowNull: false,
    }
  });
  answerSchema.belongsTo(dash);

  answerSchema.hasOne(questionStore,{
    foreignKey:{
      type: DataTypes.UUID,
      allowNull: false,
    }
  });
  questionStore.belongsTo(answerSchema);
  return dash;
};