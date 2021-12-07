
module.exports = (sequelize, DataTypes) => {
  const answermodel = sequelize.define('answermodel', {
    roundNo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dashmodelId : {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  return answermodel;
}