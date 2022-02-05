const { UUIDV4 , DataTypes } = require("sequelize")
module.exports = (sequelize) => {
  const question_set_model = sequelize.define("question_set_model",{
    quesId:{
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
    },
    quesText: {
      type: DataTypes.STRING,
      allowNull: false
    },  
    ImageLink: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AudioLink: {
      type: DataTypes.STRING,
      allowNull: true
    },
    quesType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    options: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });
  return question_set_model;
}