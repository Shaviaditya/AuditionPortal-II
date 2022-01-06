const { UUIDV4 , DataTypes } = require("sequelize")
module.exports = (sequelize) => {
  const question_set_model = sequelize.define("question_set_model",{
    roundNo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    roundId:{
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
    },
    quesText: {
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
  });
  return question_set_model;
}