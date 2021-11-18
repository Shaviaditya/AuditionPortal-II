module.exports = (sequelize, DataTypes) => {
  const question_set_model = sequelize.define("question_set_model",{
    quesText: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roundId: {
      type: DataTypes.INTEGER,
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