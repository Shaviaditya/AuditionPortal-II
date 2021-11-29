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
  return roundmodel;
}
