const { DataTypes } = require('sequelize')
module.exports = (sequelize) => {
  const answermodel = sequelize.define('answermodel', {
    roundNo: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
  return answermodel;
}